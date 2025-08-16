import type { IAuth, IDBLakeSpot, IDBTicket, IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { _id, ticket: ticketID } = await readBody(event)
    if(!_id) throw 'Không tìm ID ô câu'
    if(!ticketID) throw 'Không tìm ID vé câu'

    const config = await DB.Config.findOne().select('telegram')
    if(!config) throw 'Không tìm thấy cấu hình trang'

    const ticket = await DB.Ticket.findOne({ _id: ticketID }).select('code area status cancel user spot') as IDBTicket
    if(!ticket) throw 'Vé này không tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.user.toString() != auth._id.toString()) throw 'Bạn không phải chủ vé câu'

    const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('pig name') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const nowSpot = await DB.LakeSpot.findOne({ _id: ticket.spot }) as IDBLakeSpot
    if(!nowSpot) throw 'Không tìm thấy thông tin ô hiện tại'

    const spot = await DB.LakeSpot.findOne({ _id: _id }) as IDBLakeSpot
    if(!spot) throw 'Không tìm thấy thông tin ô đổi'
    if(spot._id.toString() == ticket.spot.toString()) throw 'Không thể đổi sang ô câu hiện tại'
    if(spot.status > 0) throw 'Ô này đã có người đặt'

    ticket.spot = spot._id
    spot.status = nowSpot.status
    nowSpot.status = 0

    await ticket.save()
    await spot.save()
    await nowSpot.save()

    // Send Tele
    const timeFormat = formatDate()
    !!config.telegram.ticket && await sendTele({
      url: config.telegram.ticket,
      message: `
        Vé Câu Đổi Chỗ Ngồi
        » Mã vé: ${ticket.code}
        » Khu vực cũ: ${areaCheck.name} - ${nowSpot.code}
        » Khu vực mới: ${areaCheck.name} - ${spot.code}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })
    
    return resp(event, { result: ticket })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})