import type { IAuth, IDBItem, IDBTicket, IDBConfig, IDBTicketOrder } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('code cancel') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    const order = await DB.TicketOrder
    .findOne({ ticket: ticket._id, user: auth._id, status: 0 })
    .populate({ path: 'cart.item' }) as IDBTicketOrder
    return resp(event, { result: order })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})