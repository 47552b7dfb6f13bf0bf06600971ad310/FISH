import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('user cancel status code spot') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé câu'
    if(ticket.status > 0) throw 'Không thể hủy vé câu đã thanh toán'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'cancel.status': true,
      'cancel.staff': auth._id,
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    // Log
    await logUser({
      user: ticket.user,
      type: 'ticket.cancel',
      action: `Hủy thanh toán vé câu <b>${ticket.code}</b>`,
    })

    return resp(event, { message: `Đã hủy vé ${ticket.code}` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})