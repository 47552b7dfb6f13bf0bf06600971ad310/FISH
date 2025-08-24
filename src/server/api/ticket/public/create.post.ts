import type { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket, IDBUser, IDBVoucher, IDBItem, IDBTicketOrder } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const body = await readBody(event)
    const { area, spot, shift, lunch, pig, pay_type, voucher : voucherID, cart } = body
    if(!area) throw 'Không tìm thấy dữ liệu khu vực'
    if(!spot) throw 'Không tìm thấy dữ liệu ô câu'
    if(!shift) throw 'Không tìm thấy dữ liệu ca câu'
    if(!pay_type) throw 'Không tìm thấy phương thức thanh toán'

    const config = await DB.Config.findOne({}).select('lunch gate member time miss telegram') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'
    if(!!config.time.create){
      const now = DayJS(Date.now()).unix()
      const create = DayJS(config.time.create).unix()
      if(now < create) throw 'Chưa tới thời gian mở bán vé'
    }
    if(!!config.time.ticket.start && !!config.time.ticket.end){
      const isOpenLake = isInTime(config.time.ticket.start, config.time.ticket.end)
      if(!isOpenLake) throw 'Hồ câu chưa mở, vui lòng quay lại sau'
    }

    const user = await DB.User.findOne({ _id: auth._id }).select('name phone member vouchers statistic') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('pig name') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: spot, area: areaCheck._id }).select('status code') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'
    if(spotCheck.status > 0) throw 'Vui lòng chọn ô khác, ô này đang có người đặt'

    const shiftCheck = await DB.ConfigShift.findOne({ _id: shift }).select('price duration') as IDBConfigShift
    if(!shiftCheck) throw 'Không tìm thấy dữ liệu ca câu'

    const ticketHas = await DB.Ticket.count({ 'user': user._id, 'cancel.status': false })
    if(ticketHas > 0) throw 'Bạn đang có 1 vé đang hoạt động, không thể đặt thêm vé mới'

    // Check Heo
    let pigPrice = 0
    if(!!pig && areaCheck.pig.max > 0) pigPrice = areaCheck.pig.max

    // Check Voucher
    let discountVoucher = 0
    let voucherSelect
    if(!!voucherID){
      const voucher = await DB.Voucher.findOne({ _id: voucherID }).select('value limit expired') as IDBVoucher
      if(!voucher) throw 'Thẻ giảm giá không tồn tại'
      if(!user.vouchers.includes(voucher._id)) throw 'Thẻ giảm giá bạn dùng không có trong kho đồ'
      if(voucher.limit > 0){
        const countUse = await DB.VoucherHistory.count({ voucher: voucher._id })
        if(countUse >= voucher.limit) throw 'Thẻ giảm giá đã đạt giới hạn sử dụng'
      }
      if(!!voucher.expired){
        const now = DayJS().unix()
        const expired = DayJS(voucher.expired).unix()
        if(now > expired) throw 'hẻ giảm giá đã hết hạn sử dụng'
      }
      discountVoucher = voucher.value
      voucherSelect = voucher
    }

    // Check Miss
    let discountMiss = 0
    if(!!config.miss && user.statistic.miss > 0){
      const maxKey = Math.max(...Object.keys(config.miss).map(Number));
      const key = user.statistic.miss >= maxKey ? maxKey : user.statistic.miss
      // @ts-expect-error
      const value = config.miss[key]
      discountMiss = value || 0
    }

    // Make Discount Member 
    const member = getMember(user.member)
    const discountTime = !!member ? (member.data.free.time > shiftCheck.duration ? true : false) : false
    const discountLunch = !!lunch ? (!!member ? (member.data.free.lunch > 0 ? true : false) : false) : false
    // @ts-expect-error
    const discountPrice = !!member ? config.member[member.type].discount : 0

    // Make Discount
    let discount = discountPrice + discountVoucher + discountMiss
    discount = discount > 100 ? 100 : discount

    // Check Cart
    const cartOrder : any = []
    const cartName : any = []
    let totalItem = 0
    let hasOrder = false
    if(!!cart && cart.length > 0){
      await Promise.all(cart.map(async (product : any) => {
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

        cartName.push(`${item.name} x${product.amount}`)
  
        const price = product.amount * itemPrice
        totalItem = totalItem + price
      }))

      hasOrder = true
    }

    // Make Total
    let total = shiftCheck.price
    if(!!lunch) total = total + config.lunch.price
    if(!!discountTime) total = total - shiftCheck.price
    if(!!discountLunch) total = total - config.lunch.price
    if(discount > 0) total = total - Math.floor(total * discount / 100)
    if(pigPrice > 0) total = total + pigPrice
    if(!!hasOrder) total = total + totalItem

    // Make Code, Token
    const countTick = await DB.Ticket.count()
    const code = 'SENTICK' + (countTick > 9 ? countTick : `0${countTick}`) +  Math.floor(Math.random() * (99 - 10) + 10)
    const token = md5(`${code}-${Date.now()}`)

    // Make QR
    let qrcode
    qrcode = config.gate.qr
    qrcode = qrcode.replaceAll('[money]', String(total))
    qrcode = qrcode.replaceAll('[code]', code)
    qrcode = qrcode.replaceAll('[token]', token)
    qrcode = qrcode.replaceAll('[gate-name]', config.gate.name)
    qrcode = qrcode.replaceAll('[gate-number]', config.gate.number)
    qrcode = qrcode.replaceAll('[gate-person]', config.gate.person)

    // Set Time
    const timeNow = new Date()
    const timePay = new Date(timeNow.getTime() + config.time.pay * 60 * 1000)
    const timeFormat = formatDate(timeNow)

    // Create
    const newTicket = await DB.Ticket.create({
      user: user._id,
      area: areaCheck._id,
      spot: spotCheck._id,
      shift: shiftCheck._id,
      code: code,
      lunch: {
        has: !!lunch ? true : false,
      },
      time: {
        pay: timePay,
      },
      price: {
        spot: shiftCheck.price,
        lunch: !!lunch ? config.lunch.price : 0,
        item: totalItem,
        pig: pigPrice,
        total: total,
      },
      discount: {
        time: discountTime,
        lunch: discountLunch,
        price: discountPrice,
        miss: discountMiss,
        voucher: !!voucherSelect ? voucherSelect._id : null
      },
      pay: {
        qrcode: qrcode,
        token: token,
        type: pay_type,
      }
    }) as IDBTicket

    // Update Spot
    await DB.LakeSpot.updateOne({ _id: spotCheck._id }, { status: 1 })

    // Update Order
    if(!!hasOrder){
      const countOrder = await DB.TicketOrder.count()
      const codeOrder = 'SENOD' + (countOrder > 9 ? countOrder : `0${countOrder}`) +  Math.floor(Math.random() * (99 - 10) + 10)
      const tokenOrder = md5(`${codeOrder}-${Date.now()}`)

      const newOrder = await DB.TicketOrder.create({
        ticket: newTicket._id,
        user: user._id,
        code: codeOrder,
        cart: cartOrder,
        total: totalItem,
        pay: {
          token: tokenOrder,
          type: pay_type
        },
        status: 0
      }) as IDBTicketOrder

      newTicket.withOrder = newOrder._id
      await newTicket.save()
    }

    // Log User
    await logUser({
      user: user._id,
      type: 'ticket.create',
      action: `Đặt chỗ câu với mã vé <b>${newTicket.code}</b>`,
    })

    // Send Tele
    !!config.telegram.ticket && await sendTele({
      url: config.telegram.ticket,
      message: `
        Vé Câu Mới Được Tạo
        » Mã vé: ${code}
        » Khu vực: ${areaCheck.name} - ${spotCheck.code}
        » Khách hàng: ${user.name} - ${user.phone}
        » Cần thanh toán: ${total.toLocaleString('vi-VN')}
        » Gọi dịch vụ: ${cartName.length > 0 ? cartName.join(' | ') : 'Không'}
        » Phương thức: ${pay_type}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })

    // Success
    if(total == 0) await verifyTicketSuccess({ code: code, money: 0 })

    return resp(event, { message: 'Đặt chỗ thành công', result: code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})