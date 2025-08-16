import { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { ticket : ticketCode, shift: shiftID, pay_type } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé câu'
    if(!shiftID) throw 'Vui lòng chọn ca nối'
    if(!pay_type) throw 'Vui lòng chọn phương thức thanh toán'

    const config = await DB.Config.findOne({}).select('gate telegram') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'
    
    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('cancel status user code area spot shift') as IDBTicket
    if(!ticket) throw 'Vé câu không tồn tại'
    if(!!ticket.cancel.status) throw 'Vé câu đã bị hủy'
    if(ticket.status != 2) throw 'Không thể thao tác trên vé câu này'
    if(ticket.user.toString() != auth._id.toString()) throw 'Bạn không phải chủ vé câu'

    const area = await DB.LakeArea.findOne({ _id: ticket.area }).select('name') as IDBLakeArea
    if(!area) throw 'Không tìm khu vực câu'

    const spot = await DB.LakeSpot.findOne({ _id: ticket.spot }).select('code') as IDBLakeSpot
    if(!spot) throw 'Không tìm ô câu'

    const has = await DB.TicketConnect.count({ ticket: ticket._id, user: auth._id, status: 0 }) 
    if(has > 0) throw 'Bạn đang có 1 đơn nối ca đang xử lý, vui lòng đợi đơn đó hoàn thành'

    const oldShift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration price') as IDBConfigShift
    if(!oldShift) throw 'Không tìm thấy thời gian câu hiện tại'
    
    const newShift = await DB.ConfigShift.findOne({ _id: shiftID, area: area._id, display: true }).select('duration price') as IDBConfigShift
    if(!newShift) throw 'Không tìm thấy thời gian câu nối thêm'
    if(oldShift._id.toString() == newShift._id.toString()) throw 'Thời gian câu nối không hợp lệ'
    if(newShift.duration < oldShift.duration) throw 'Thời gian câu nối không hợp lệ'

    // Make Total
    const total = newShift.price - oldShift.price

    // Make Code, Token
    const count = await DB.TicketConnect.count()
    const code = 'SENCN' + (count > 9 ? count : `0${count}`) +  Math.floor(Math.random() * (99 - 10) + 10)
    const token = md5(`${code}-${Date.now()}`)

    // Make QR
    let qrcode
    qrcode = config.gate.qr
    qrcode = qrcode.replaceAll('[money]', String(total))
    qrcode = qrcode.replaceAll('[code]', code)
    qrcode = qrcode.replaceAll('[token]', token)
    qrcode = qrcode.replaceAll('[gate-name]', config.gate.name)
    qrcode = qrcode.replaceAll('[gate-number]', config.gate.number)
    qrcode = qrcode.replaceAll('[gate-person]', config.gate.person)

    // Create
    const order = await DB.TicketConnect.create({
      ticket: ticket._id,
      user: auth._id,
      code: code,
      old: oldShift._id,
      new: newShift._id,
      total: total,
      pay: {
        type: pay_type,
        qrcode: qrcode,
        token: token,
      },
      status: 0
    })

    // Send Tele
    const timeFormat = formatDate()
    !!config.telegram.ticket && await sendTele({
      url: config.telegram.ticket,
      message: `
        Xác Nhận Vé Câu Muốn Nối Giờ
        » Mã vé: ${ticket.code}
        » Khu vực: ${area.name} - ${spot.code}
        » Từ: ${oldShift.duration} giờ
        » Lên: ${newShift.duration} giờ
        » Cần thanh toán: ${total.toLocaleString('vi-VN')}
        » Phương thức: ${pay_type}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })
    
    return resp(event, { result: order })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})