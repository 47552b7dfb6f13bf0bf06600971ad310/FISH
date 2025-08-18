import type { IAuth, IDBItem, IDBTicket, IDBLakeArea, IDBLakeSpot, IDBConfig } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { cart } = await readBody(event)
    if(!cart) throw 'Không tìm thấy giỏ hàng'
    if(!Array.isArray(cart)) throw 'Giỏ hàng không hợp lệ'

    const config = await DB.Config.findOne({}).select('gate member telegram') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'

    // Make Total and Item
    const cartOrder : any = []
    let total = 0
    await Promise.all(cart.map(async (product) => {
      const item = await DB.Item.findOne({ _id: product.item }).select('name price inventory display') as IDBItem
      if(!item) throw 'Có 1 sản phẩm không tồn tại'
      if(!item.display || item.inventory == 0) throw `${item.name} hiện đã hết hàng`
      if(item.inventory < product.amount) throw `${item.name} chỉ còn ${item.inventory} sản phẩm trong kho, vui lòng chọn lại số lượng`

      let itemPrice = item.price

      cartOrder.push({
        item: item._id,
        amount: product.amount,
        price: itemPrice
      })

      const price = product.amount * itemPrice
      total = total + price
    }))

    // Make Code, Token
    const countOrder = await DB.TicketOrder.count()
    const codeOrder = 'SENOD' + (countOrder > 9 ? countOrder : `0${countOrder}`) +  Math.floor(Math.random() * (99 - 10) + 10)
    const tokenOrder = md5(`${codeOrder}-${Date.now()}`)

    // Make QR
    let qrcode
    qrcode = config.gate.qr
    qrcode = qrcode.replaceAll('[money]', String(total))
    qrcode = qrcode.replaceAll('[code]', codeOrder)
    qrcode = qrcode.replaceAll('[token]', tokenOrder)
    qrcode = qrcode.replaceAll('[gate-name]', config.gate.name)
    qrcode = qrcode.replaceAll('[gate-number]', config.gate.number)
    qrcode = qrcode.replaceAll('[gate-person]', config.gate.person)

    // Create
    const order = await DB.TicketOrder.create({
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

    return resp(event, { message: 'Tạo đơn thành công', result: order.code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})