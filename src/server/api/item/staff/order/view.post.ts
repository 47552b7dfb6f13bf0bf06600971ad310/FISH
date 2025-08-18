import { IDBTicketOrder } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã đơn hàng'

    const order = await DB.TicketOrder
    .findOne({ code: code })
    .populate({ path: 'cart.item' }) as IDBTicketOrder

    return resp(event, { result: order })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})