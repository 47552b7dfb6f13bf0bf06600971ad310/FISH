import type { IAuth, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Bạn không có quyền thao tác'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('area spot user') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'

    const ticketNow = await DB.Ticket.findOne({ 'area': ticket.area, 'spot': ticket.spot, 'cancel.status': false }) as IDBTicket
    if(!ticketNow) await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    // Xóa dữ liệu
    await DB.TicketOrder.deleteMany({ ticket: ticket._id })
    await DB.TicketConnect.deleteMany({ ticket: ticket._id })
    await DB.TicketFish.deleteMany({ ticket: ticket._id })
    await DB.Ticket.deleteOne({ _id: ticket._id })

    return resp(event, { message: `Thao tác thành công` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})