import type { IAuth, IDBItem, IDBTicket, IDBConfig, IDBTicketOrder } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { ticket: ticketCode, order: orderCode, pay_type } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé'
    if(!orderCode) throw 'Không tìm mã giao dịch'
    if(!pay_type) throw "Vui lòng chọn phương thức thanh toán"

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('user code cancel price withOrder') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    const order = await DB.TicketOrder.findOne({ ticket: ticket._id, code: orderCode }).select('pay status cart total') as IDBTicketOrder
    if(!order) throw 'Đơn hàng còn tồn tại'
    if(order.status > 0) throw 'Không thể thao tác trên đơn hàng này'

    // Update Order
    order.status = 1
    order.staff = auth._id
    order.pay.type = pay_type
    await order.save()

    // Update Export Item
    const list = order.cart.map(product => ({
      user: ticket.user,
      ticket: ticket._id,
      order: order._id,
      staff: auth._id,

      item: product.item,
      amount: product.amount,
      price: product.price,
    }))
    await DB.ItemExport.insertMany(list)

    // Update Inventory Item
    await Promise.all(order.cart.map(async (product) => {
      const item = product.item
      const amount = product.amount

      await DB.Item.updateOne({ _id: item }, { $inc: { inventory: amount * -1 } })
    }))

    // Update Ticket
    if(ticket.withOrder.toString() != order._id.toString() && order.total > 0) await DB.Ticket.updateOne({ _id: ticket._id }, { $inc: { 
      'price.total': order.total,
      'price.item': order.total,
    }})

    // Update User Statistic
    if(ticket.withOrder.toString() != order._id.toString() && order.total > 0) await DB.User.updateOne({ _id: ticket.user }, { $inc: {
      'statistic.pay': order.total,
      'statistic.payweek': order.total,
    }})
    
    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})