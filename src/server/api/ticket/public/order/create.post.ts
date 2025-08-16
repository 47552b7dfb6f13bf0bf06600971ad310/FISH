import type { IAuth, IDBItem, IDBTicket, IDBLakeArea, IDBLakeSpot, IDBConfig } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code, cart } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'
    if(!cart) throw 'Không tìm thấy giỏ hàng'
    if(!Array.isArray(cart)) throw 'Giỏ hàng không hợp lệ'

    const config = await DB.Config.findOne({}).select('gate member telegram') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('code cancel status area spot') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.status != 2) throw 'Không thể thao tác trên vé câu này'

    // Get Area
    const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('name') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'
  
    // Get Spot
    const spotCheck = await DB.LakeSpot.findOne({ _id: ticket.spot }).select('code') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'
    
    // Check Waiting
    const has = await DB.TicketOrder.count({ ticket: ticket._id, user: auth._id, status: 0 }) 
    if(has > 0) throw 'Bạn đang có 1 đơn hàng đang xử lý, vui lòng đợi đơn hàng đó hoàn thành'

    // Make Discount
    const member = getMember(auth.member)
    // @ts-expect-error
    const discountPrice = !!member ? config.member[member.type].discount : 0

    // Make Total and Item
    const cartOrder : any = []
    let total = 0
    await Promise.all(cart.map(async (product) => {
      const item = await DB.Item.findOne({ _id: product.item }).select('name price inventory display') as IDBItem
      if(!item) throw 'Có 1 sản phẩm không tồn tại'
      if(!item.display || item.inventory == 0) throw `${item.name} hiện đã hết hàng`
      if(item.inventory < product.amount) throw `${item.name} chỉ còn ${item.inventory} sản phẩm trong kho, vui lòng chọn lại số lượng`

      let itemPrice = item.price
      if(discountPrice > 0) itemPrice = itemPrice - Math.floor(itemPrice * discountPrice / 100)

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

    // Send Tele
    const timeFormat = formatDate()
    !!config.telegram.order && await sendTele({
      url: config.telegram.order,
      message: `
        Đơn Gọi Dịch Vụ Mới
        » Mã vé: ${codeOrder}
        » Khu vực: ${areaCheck.name} - ${spotCheck.code}
        » Cần thanh toán: ${total.toLocaleString('vi-VN')}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })

    return resp(event, { message: 'Gọi dịch vụ thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})