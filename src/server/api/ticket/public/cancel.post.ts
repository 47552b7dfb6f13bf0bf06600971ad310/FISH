import type { IAuth, IDBConfig, IDBTicket, IDBLakeArea, IDBLakeSpot } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const config = await DB.Config.findOne({}).select('telegram') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('area spot user cancel status code spot') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé câu'
    if(ticket.status > 0) throw 'Không thể hủy vé câu đã thanh toán'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('name') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: ticket.spot }).select('code') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'cancel.status': true,
      'cancel.staff': auth._id,
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    // Send Tele
    const timeFormat = formatDate()
    !!config.telegram.ticket && await sendTele({
      url: config.telegram.ticket,
      message: `
        Vé Câu Đã Hủy Bởi Người Tạo
        » Mã vé: ${ticket.code}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })

    // Log
    await logUser({
      user: ticket.user,
      type: 'ticket.cancel',
      action: `Hủy thanh toán vé câu <b>${ticket.code}</b>`,
    })

    // Talk
    await talk([`${areaCheck.name}`, `${spotCheck.code}`, 'đã hủy', 'bởi', 'khách hàng'])

    return resp(event, { message: `Đã hủy vé ${ticket.code}` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})