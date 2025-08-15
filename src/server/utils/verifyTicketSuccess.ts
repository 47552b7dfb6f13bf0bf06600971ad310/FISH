import type { Types } from 'mongoose'
import { IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket, IDBUser } from "~~/types"

interface IBodyData {
  code: string,
  money: number
}

export default async ({ code, money } : IBodyData, verifier? : Types.ObjectId) : Promise<void> => {
  if(!code) throw 'Không tìm thấy mã vé'
  if(
    !!isNaN(parseInt(String(money))) 
    || parseInt(String(money)) < 0 
  ) throw 'Số tiền không hợp lệ'

  // Get Bot
  const bot = await DB.User.findOne({'phone': 'bot'}).select('name') as IDBUser
  if(!bot) throw 'Không tìm thấy thông tin Bot'

  // Get Config
  const config = await DB.Config.findOne().select('telegram') as IDBConfig
  if(!config) throw 'Không tìm thấy cấu hình trang'

  // Get Ticket
  const ticket = await DB.Ticket.findOne({ code: code }) as IDBTicket
  if(!ticket) throw 'Không tìm thấy dữ liệu vé'
  if(!!ticket.cancel.status) throw 'Vé đã bị hủy'
  if(!!ticket.pay.complete) throw 'Vé này đã được xác nhận thanh toán'
  if(Number(money) < ticket.price.total) throw 'Số tiền chuyển vào không đủ'

  // Get Area
  const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('pig name') as IDBLakeArea
  if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

  // Get Spot
  const spotCheck = await DB.LakeSpot.findOne({ _id: ticket.spot }).select('code') as IDBLakeSpot
  if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'

  // Get Shift
  const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
  if(!shift) throw 'Không tìm thấy thời gian ca câu'

  // Get User
  const user = await DB.User.findOne({ _id: ticket.user }).select('vouchers member') as IDBUser
  if(!user) throw 'Không tìm thấy tài khoản khách hàng'

  // Set Thời gian
  const start = new Date();
  const end = new Date(start.getTime() + shift.duration * 60 * 60 * 1000)
  const delay = new Date(end.getTime() + 5 * 60 * 1000)
  const timeFormat = formatDate(start)

  // Cập nhật trạng thái vé
  await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
    'time.pay': null,
    'time.start': start,
    'time.end': end,
    'time.delay': delay,
    'pay.complete': true,
    'pay.staff': !!verifier ? verifier : bot._id,
    'status': 2
  }})

  // Cập nhật trạng thái ô câu
  await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 3 })

  // Xóa Voucher User nếu có
  if(ticket.discount.voucher) await delUserVoucher(user, ticket.discount.voucher)

  // Cập nhật thông số tài khoản
  if(ticket.price.total > 0) await DB.User.updateOne({ _id: ticket.user }, { $inc: {
    'statistic.pay': ticket.price.total,
    'statistic.payweek': ticket.price.total,
  }})

  // Cập nhật lại số lần miễn phí hôi viên
  const member = getMember(user.member)
  !!member && await DB.User.updateOne({ _id: user._id }, { $inc: { 
    [`member.${member.type}.free.time`]: !!ticket.discount.time ? shift.duration * -1 : 0,
    [`member.${member.type}.free.lunch`]: !!ticket.discount.lunch ? -1 : 0,
  }})

  // Cập nhật Heo nếu có
  if(ticket.price.total > 0 && ticket.price.pig > 0) await DB.LakeArea.updateOne(
    { _id: areaCheck._id }, 
    { $inc: { 'pig.money': areaCheck.pig.max }}
  )

  // Log User
  logUser({
    user: user._id,
    type: 'ticket.pay.success',
    action: `Thanh toán vé <b>${ticket.code}</b> với số tiền <b>${ticket.price.total.toLocaleString("vi-VN")}đ</b>`,
  })

  // Send Tele
  !!config.telegram.ticket && await sendTele({
    url: config.telegram.ticket,
    message: `
      Vé Câu Đã Xác Nhận Thanh Toán
      » Mã vé: ${ticket.code}
      » Khu vực: ${areaCheck.name} - ${spotCheck.code}
      » Đã thanh toán: ${ticket.price.total.toLocaleString('vi-VN')}
      » Đăng ký cơm: ${ticket.lunch.has ? 'Có' : 'Không'}
      » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
    `
  })

  // Update Lake Info
  await socketUpdateLakeInfo()
}