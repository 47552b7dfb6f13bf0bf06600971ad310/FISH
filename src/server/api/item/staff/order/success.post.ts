import type { IAuth, IDBTicketOrder } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { order: orderCode, pay_type } = await readBody(event)
    if(!orderCode) throw 'Không tìm mã giao dịch'
    if(!pay_type) throw "Vui lòng chọn phương thức thanh toán"

    const order = await DB.TicketOrder.findOne({ code: orderCode }).select('pay status cart total') as IDBTicketOrder
    if(!order) throw 'Đơn hàng còn tồn tại'
    if(order.status > 0) throw 'Không thể thao tác trên đơn hàng này'
    if(!!order.ticket) throw 'Không thể thao tác với đơn hàng đi kèm với vé'

    // Update Order
    order.status = 1
    order.staff = auth._id
    order.pay.type = pay_type
    await order.save()

    // Update Export Item
    const list = order.cart.map(product => ({
      user: order.user,
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

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})