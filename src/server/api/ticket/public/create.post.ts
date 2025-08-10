import type { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket, IDBUser, IDBVoucher } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const body = await readBody(event)
    const { area, spot, shift, lunch, pay_type, voucher : voucherID } = body
    if(!area) throw 'Không tìm thấy dữ liệu khu vực'
    if(!spot) throw 'Không tìm thấy dữ liệu ô câu'
    if(!shift) throw 'Không tìm thấy dữ liệu ca câu'
    if(!pay_type) throw 'Không tìm thấy phương thức thanh toán'

    const config = await DB.Config.findOne({}).select('lunch gate member') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'

    const user = await DB.User.findOne({ _id: auth._id }).select('vouchers') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: spot, area: areaCheck._id }).select('status') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'
    if(spotCheck.status > 0) throw 'Vui lòng chọn ô khác, ô này đang có người đặt'

    const shiftCheck = await DB.ConfigShift.findOne({ _id: shift }).select('price duration') as IDBConfigShift
    if(!shiftCheck) throw 'Không tìm thấy dữ liệu ca câu'

    const ticketHas = await DB.Ticket.count({ 'user': auth._id, 'cancel.status': false })
    if(ticketHas > 0) throw 'Bạn đang có 1 vé đang hoạt động, không thể đặt thêm vé mới'

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

    // Make Discount
    const member = getMember(auth.member)
    const discountTime = !!member ? (member.data.free.time > shiftCheck.duration ? true : false) : false
    const discountLunch = !!lunch ? (!!member ? (member.data.free.lunch > 0 ? true : false) : false) : false
    // @ts-expect-error
    const discountPrice = !!member ? config.member[member.type].discount : 0
    let discount = discountPrice + discountVoucher
    discount = discount > 100 ? 100 : discount

    // Make Total
    let total = shiftCheck.price
    if(!!lunch) total = total + config.lunch.price
    if(!!discountTime) total = total - shiftCheck.price
    if(!!discountLunch) total = total - config.lunch.price
    if(discount > 0) total = total - Math.floor(total * discount / 100)

    // Make Code, Token
    const countTick = await DB.Ticket.count()
    const code = (config.gate.prefix || 'SEN') + (countTick > 9 ? countTick : `0${countTick}`) +  Math.floor(Math.random() * (99 - 10) + 10)
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

    // Create
    await DB.Ticket.create({
      user: auth._id,
      area: areaCheck._id,
      spot: spotCheck._id,
      shift: shiftCheck._id,
      code: code,
      lunch: {
        has: !!lunch ? true : false,
      },
      time: {
        pay: !hasPay ? new Date(Date.now() + 10 * 60 * 1000) : null
      },
      price: {
        spot: shiftCheck.price,
        lunch: !!lunch ? config.lunch.price : 0,
        total: total,
      },
      discount: {
        time: discountTime,
        lunch: discountLunch,
        price: discountPrice,
        voucher: !!voucherSelect ? voucherSelect._id : null
      },
      pay: {
        qrcode: qrcode,
        token: token,
        type: pay_type,
        complete: !hasPay ? false : true,
        staff: !hasPay ? null : auth._id
      },
      status: !hasPay ? 0 : 1
    })
    await DB.LakeSpot.updateOne({ _id: spotCheck._id }, { status: !hasPay ? 1 : 2 })
    
    // Update User
    !!member && await DB.User.updateOne({ _id: auth._id }, { $inc: { 
      [`member.${member.type}.free.time`]: !!discountTime ? shiftCheck.duration * -1 : 0,
      [`member.${member.type}.free.lunch`]: !!discountLunch ? -1 : 0,
    }})

    if(!!hasPay && !!voucherSelect) await delUserVoucher(user, voucherSelect._id)

    return resp(event, { message: 'Đặt chỗ thành công', result: code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})