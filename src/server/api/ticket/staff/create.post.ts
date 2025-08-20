import type { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket, IDBUser, IDBVoucher } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Chức năng này chỉ dành cho nhân viên'

    const body = await readBody(event)
    const { phone, area, spot, shift, lunch, pig, pay_type, start } = body
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

    const user = await DB.User.findOne({ phone: phone }).select('name phone statistic') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('pig name') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: spot, area: areaCheck._id }).select('status code') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'
    if(spotCheck.status > 0) throw 'Vui lòng chọn ô khác, ô này đang có người đặt'

    const shiftCheck = await DB.ConfigShift.findOne({ _id: shift }).select('price duration') as IDBConfigShift
    if(!shiftCheck) throw 'Không tìm thấy dữ liệu ca câu'

    const ticketHas = await DB.Ticket.count({ 'user': user._id, 'cancel.status': false })
    if(ticketHas > 0) throw 'Khách này đang có 1 vé đang hoạt động, không thể đặt thêm vé mới'

    // Check Heo
    let pigPrice = 0
    if(!!pig && areaCheck.pig.max > 0) pigPrice = areaCheck.pig.max

    // Check Voucher
    const discountVoucher = 0
    const discountMiss = 0
    const discountTime = false
    const discountLunch = false
    const discountPrice = 0

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

    // Set Start
    let startTime : any = null
    if(!!start){
      const today = DayJS()
      const [hours, minutes] = start.split(":")
      if(!hours || !minutes) throw 'Định dạng thời gian không đúng'
      const timeStartFormat = today.hour(parseInt(hours)).minute(parseInt(minutes)).second(0)
      startTime = timeStartFormat.toDate()
    }

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
        start: startTime || null,
        pay: timePay,
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
        voucher: null
      },
      pay: {
        qrcode: qrcode,
        token: token,
        type: pay_type,
      },
      guest: {
        status: true,
        staff: auth._id
      }
    }) as IDBTicket

    // Update Spot
    await DB.LakeSpot.updateOne({ _id: spotCheck._id }, { status: 1 })

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
        » Phương thức: ${pay_type}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })

    if(!!formatDate())

    // Success
    if(total == 0) await verifyTicketSuccess({ code: code, money: 0 })

    return resp(event, { message: 'Đặt chỗ thành công', result: code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})