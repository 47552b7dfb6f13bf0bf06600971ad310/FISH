import type { IAuth, IDBTicket, IDBConfigShift } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('cancel status spot user code') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.status != 3) throw 'Vé câu chưa kết thúc giờ câu'

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'cancel.staff': auth._id,
      'cancel.status': true, 
      'status': 4
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    // Log
    await logUser({
      user: ticket.user,
      type: 'ticket.end',
      action: `Xác nhận hoàn thành vé câu <b>${ticket.code}</b>`,
    })

    return resp(event, { result: true })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})