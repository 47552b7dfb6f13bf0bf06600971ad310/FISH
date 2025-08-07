import type { IAuth, IDBItem, IDBTicket, IDBConfig } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code, cart } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'
    if(!cart) throw 'Không tìm thấy giỏ hàng'
    if(!Array.isArray(cart)) throw 'Giỏ hàng không hợp lệ'

    const config = await DB.Config.findOne({}).select('gate') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('code cancel status') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel) throw 'Vé này đã bị hủy'
    if(ticket.status == 0) throw 'Vé này chưa khả dụng'
    if(ticket.status == 2) throw 'Vé này đã hết hạn'

    const has = await DB.TicketOrder.count({ ticket: ticket._id, user: auth._id, status: 0 }) 
    if(has > 0) throw 'Bạn đang có 1 đơn hàng đang xử lý, vui lòng đợi đơn hàng đó hoàn thành'

    const cartOrder : any = []
    let total = 0
    await Promise.all(cart.map(async (product) => {
      const item = await DB.Item.findOne({ _id: product.item }).select('name price inventory display') as IDBItem
      if(!item) throw 'Có 1 sản phẩm không tồn tại'
      if(!item.display || item.inventory == 0) throw `${item.name} hiện đã hết hàng`
      if(item.inventory < product.amount) throw `${item.name} chỉ còn ${item.inventory} sản phẩm trong kho, vui lòng chọn lại số lượng`

      cartOrder.push({
        item: item._id,
        amount: product.amount,
        price: item.price
      })

      const price = product.amount * item.price
      total = total + price
    }))

    const countOrder = await DB.TicketOrder.count({ ticket: ticket._id })
    const codeOrder = "OD" + '-' + ticket.code + '-' + (countOrder > 9 ? countOrder : `0${countOrder}`)
    const tokenOrder = md5(`${code}-${Date.now()}`)

    let qrcode
    qrcode = config.gate.qr
    qrcode = qrcode.replaceAll('[money]', String(total))
    qrcode = qrcode.replaceAll('[code]', codeOrder)
    qrcode = qrcode.replaceAll('[token]', tokenOrder)
    qrcode = qrcode.replaceAll('[gate-name]', config.gate.name)
    qrcode = qrcode.replaceAll('[gate-number]', config.gate.number)
    qrcode = qrcode.replaceAll('[gate-person]', config.gate.person)

    const order = await DB.TicketOrder.create({
      ticket: ticket._id,
      user: auth._id,
      code: codeOrder,
      cart: cartOrder,
      total: total,
      pay: {
        qrcode: qrcode,
        token: tokenOrder,
      },
      status: 0
    })

    return resp(event, { message: 'Gọi dịch vụ thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})