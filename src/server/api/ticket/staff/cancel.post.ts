import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền thao tác'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('cancel complete code spot status fish user') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'cancel.staff': auth._id,
      'cancel.status': true,
      'status': 4 
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    // Cập nhật Miss
    if(ticket.fish.amount > 0) await DB.User.updateOne(
      { _id: ticket.user }, 
      { $set: { 'statistic.miss': 0 }}
    )
    if(ticket.fish.amount <= 0 && ticket.status == 3) await DB.User.updateOne(
      { _id: ticket.user }, 
      { $inc: { 'statistic.miss': 1 }}
    )

    return resp(event, { message: `Thao tác thành công` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})