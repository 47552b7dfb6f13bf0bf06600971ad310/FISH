import type { IAuth, IDBTicket, IDBTicketOrder } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { order: orderCode } = await readBody(event)
    if(!orderCode) throw 'Không tìm mã giao dịch'

    const order = await DB.TicketOrder.findOne({ code: orderCode }).select('status cart total') as IDBTicketOrder
    if(!order) throw 'Đơn hàng còn tồn tại'
    if(order.status > 0) throw 'Không thể thao tác trên đơn hàng này'
    if(!!order.ticket) throw 'Không thể thao tác với đơn hàng đi kèm với vé'

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