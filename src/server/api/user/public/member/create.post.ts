import type { IAuth, IDBConfig, IDBUser } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const body = await readBody(event)
    const { type } = body
    if(!type) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!['month', 'week'].includes(type)) throw 'Gói nâng cấp không hỗ trợ'
    if(type == 'week' && !!auth.member.month.enable) throw 'Bạn đang là hội viên tháng, không thể mua hội viên tuần'

    const config = await DB.Config.findOne({}).select('member gate telegram') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'

    const user = await DB.User.findOne({ _id: auth._id }).select('name phone') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'

    const waiting = await DB.UserMember.findOne({ user: auth._id, status: 0 })
    if(waiting) return resp(event, { message: 'Bạn có 1 đơn đăng ký chưa xử lý, vui lòng thanh toán hoặc hủy đơn đăng ký này', result: waiting }) 
    
    // @ts-expect-error
    const price = config.member[type].price
    const countMember = await DB.UserMember.count()
    const code = 'SENMEM' + (countMember > 9 ? countMember : `0${countMember}`) +  Math.floor(Math.random() * (99 - 10) + 10)
    const token = md5(`${code}-${Date.now()}`)

    let qrcode
    qrcode = config.gate.qr
    qrcode = qrcode.replaceAll('[money]', String(price))
    qrcode = qrcode.replaceAll('[code]', code)
    qrcode = qrcode.replaceAll('[token]', token)
    qrcode = qrcode.replaceAll('[gate-name]', config.gate.name)
    qrcode = qrcode.replaceAll('[gate-number]', config.gate.number)
    qrcode = qrcode.replaceAll('[gate-person]', config.gate.person)

    const order = await DB.UserMember.create({
      user: auth._id,
      code: code,
      type: type,
      price: price,
      qrcode: qrcode,
      token: token
    })

    // Send Tele
    const timeFormat = formatDate()
    !!config.telegram.member && await sendTele({
      url: config.telegram.member,
      message: `
        Đơn Đăng Ký Hội Viên Mới
        » Mã đơn: ${code}
        » Khách hàng: ${user.name} - ${user.phone}
        » Cần thanh toán: ${price.toLocaleString('vi-VN')}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })

    return resp(event, { result: order })
  }
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})