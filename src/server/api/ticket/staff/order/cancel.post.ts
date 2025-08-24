import type { IAuth, IDBTicket, IDBTicketOrder } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { ticket: ticketCode, order: orderCode } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé'
    if(!orderCode) throw 'Không tìm mã giao dịch'

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('user code pay withOrder') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    
    const order = await DB.TicketOrder.findOne({ ticket: ticket._id, code: orderCode }).select('status cart total') as IDBTicketOrder
    if(!order) throw 'Đơn hàng còn tồn tại'
    if(order.status > 0) throw 'Không thể thao tác trên đơn hàng này'
    if(!!ticket.withOrder && ticket.withOrder.toString() == order._id.toString() && !ticket.pay.complete) throw 'Vé câu chưa thanh toán'

    // Update Order
    order.status = 2
    order.staff = auth._id
    await order.save()
    
    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})