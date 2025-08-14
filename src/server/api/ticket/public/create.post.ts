import type { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket, IDBUser, IDBVoucher } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const body = await readBody(event)
    const { area, spot, shift, lunch, pig, pay_type, voucher : voucherID } = body
    if(!area) throw 'Không tìm thấy dữ liệu khu vực'
    if(!spot) throw 'Không tìm thấy dữ liệu ô câu'
    if(!shift) throw 'Không tìm thấy dữ liệu ca câu'
    if(!pay_type) throw 'Không tìm thấy phương thức thanh toán'

    const config = await DB.Config.findOne({}).select('lunch gate member time miss') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'
    if(!!config.time.create){
      const now = DayJS(Date.now()).unix()
      const create = DayJS(config.time.create).unix()
      if(now < create) throw 'Chưa tới thời gian mở bán vé'
    }

    const user = await DB.User.findOne({ _id: auth._id }).select('vouchers statistic') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('pig') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: spot, area: areaCheck._id }).select('status') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'
    if(spotCheck.status > 0) throw 'Vui lòng chọn ô khác, ô này đang có người đặt'

    const shiftCheck = await DB.ConfigShift.findOne({ _id: shift }).select('price duration') as IDBConfigShift
    if(!shiftCheck) throw 'Không tìm thấy dữ liệu ca câu'

    const ticketHas = await DB.Ticket.count({ 'user': auth._id, 'cancel.status': false })
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
    const member = getMember(auth.member)
    const discountTime = !!member ? (member.data.free.time > shiftCheck.duration ? true : false) : false
    const discountLunch = !!lunch ? (!!member ? (member.data.free.lunch > 0 ? true : false) : false) : false
    // @ts-expect-error
    const discountPrice = !!member ? config.member[member.type].discount : 0

    // Make Discount
    let discount = discountPrice + discountVoucher + discountMiss
    discount = discount > 100 ? 100 : discount

    // Make Total
    let total = shiftCheck.price
    if(!!lunch) total = total + config.lunch.price
    if(!!discountTime) total = total - shiftCheck.price
    if(!!discountLunch) total = total - config.lunch.price
    if(discount > 0) total = total - Math.floor(total * discount / 100)
    total = total + pigPrice

    // Make Code, Token
    const countTick = await DB.Ticket.count()
    const code = (config.gate.prefix || 'SENTICK') + (countTick > 9 ? countTick : `0${countTick}`) +  Math.floor(Math.random() * (99 - 10) + 10)
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

    // Has Pay
    const hasPay = total == 0

    // Set Time
    const timeNow = new Date()
    const timeStart = timeNow
    const timeEnd = new Date(timeStart.getTime() + shiftCheck.duration * 60 * 60 * 1000)
    const timeDelay = new Date(timeEnd.getTime() + config.time.delay * 60 * 1000)
    const timePay = new Date(timeNow.getTime() + config.time.pay * 60 * 1000)

    // Create
    const newTicket = await DB.Ticket.create({
      user: auth._id,
      area: areaCheck._id,
      spot: spotCheck._id,
      shift: shiftCheck._id,
      code: code,
      lunch: {
        has: !!lunch ? true : false,
      },
      time: {
        pay: !hasPay ? timePay : null,
        start: !hasPay ? null : timeStart,
        end: !hasPay ? null : timeEnd,
        delay: !hasPay ? null : timeDelay
      },
      price: {
        spot: shiftCheck.price,
        lunch: !!lunch ? config.lunch.price : 0,
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
        complete: !hasPay ? false : true,
        staff: !hasPay ? null : auth._id
      },
      status: !hasPay ? 0 : 2
    }) as IDBTicket

    // Update Spot
    await DB.LakeSpot.updateOne({ _id: spotCheck._id }, { status: !hasPay ? 1 : 3 })
    
    // Update User
    !!member && await DB.User.updateOne({ _id: auth._id }, { $inc: { 
      [`member.${member.type}.free.time`]: !!discountTime ? shiftCheck.duration * -1 : 0,
      [`member.${member.type}.free.lunch`]: !!discountLunch ? -1 : 0,
    }})

    // Xóa Voucher Nếu Sử Dụng
    if(!!hasPay && !!voucherSelect) await delUserVoucher(user, voucherSelect._id)

    // Update Lake Info
    if(!!hasPay) await socketUpdateLakeInfo()

    // Log User
    await logUser({
      user: user._id,
      type: 'ticket.create',
      action: `Đặt chỗ câu với mã vé <b>${newTicket.code}</b>`,
    })
    if(!!hasPay) await logUser({
      user: user._id,
      type: 'ticket.pay.success',
      action: `Thanh toán vé <b>${newTicket.code}</b> với số tiền <b>${total.toLocaleString("vi-VN")}đ</b>`,
    })

    return resp(event, { message: 'Đặt chỗ thành công', result: code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})