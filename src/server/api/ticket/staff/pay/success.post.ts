import { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('price') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé'

    const money = ticket.price.total
    await verifyTicketSuccess({ code, money }, auth._id)

    return resp(event, { message: 'Thao tác thánh công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})