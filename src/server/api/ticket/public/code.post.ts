import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket
    .findOne({ code: code })
    .populate({ path: 'area', select: 'name' })
    .populate({ path: 'spot', select: 'code status' })
    .populate({ path: 'shift', select: 'name duration price' }) as IDBTicket
    if(!ticket) throw 'Vé này không tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.user.toString() != auth._id.toString()) throw 'Bạn không phải chủ vé câu'

    return resp(event, { result: ticket })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})