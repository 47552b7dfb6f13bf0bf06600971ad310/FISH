import type { Types } from 'mongoose'
import type { IDBConfig, IDBUser, IDBUserMember } from '~~/types'

interface IBodyData {
  code: string,
  status: number,
  money?: number,
  reason?: string
}

export default async ({ code, status, money, reason } : IBodyData, verifier? : Types.ObjectId) : Promise<void> => {
  if(!code) throw 'Không tìm thấy mã giao dịch'
  if(
    !!isNaN(parseInt(String(status))) 
    || parseInt(String(status)) < 1 
    || parseInt(String(status)) > 2
  ) throw 'Mã trạng thái không hợp lệ'
  if(
    !!money &&
    (!!isNaN(parseInt(String(money))) || parseInt(String(money)) < 0 )
  ) throw 'Số tiền không hợp lệ'
  if(status == 2 && !reason) throw 'Không tìm thấy lý do từ chối'
  if(status == 1 && !money) throw 'Không tìm thấy số tiền thanh toán'

  // Get Bot
  const bot = await DB.User.findOne({'phone': 'bot'}).select('name') as IDBUser
  if(!bot) throw 'Không tìm thấy thông tin Bot'

  // Get Config
  const config = await DB.Config.findOne({}).select('member telegram') as IDBConfig
  if(!config) throw 'Hệ thống chưa sẵn sàng'

  // Get Order
  const order = await DB.UserMember.findOne({ code: code }) as IDBUserMember
  if(!order) throw 'Giao dịch không tồn tại'
  if(order.status > 0) throw 'Không thể thao tác trên giao dịch này'

  // Get User
  const user = await DB.User.findOne({ _id: order.user }) as IDBUser
  if(!user) throw 'Không tìm thấy thông tin tài khoản'

  // Set Real Value
  const realMoney = status == 1 ? parseInt(String(money)) : 0
  const realStatus = (status == 1 && realMoney < order.price) ? 2 : status
  const realReason = (status == 1 && realMoney < order.price) ? 'Số tiền không đủ' : reason || 'Giao dịch không hợp lệ'

  // Update Order
  const time = new Date()
  const timeFormat = formatDate(time)
  const verify_person = !!verifier ? verifier : bot._id
  await DB.UserMember.updateOne({ _id: order._id }, {
    status: realStatus,
    money: realMoney,
    verify: {
      person: verify_person,
      time: time,
      reason: realReason
    }
  })

  // Check Status
  if(realStatus == 1){
    if(order.type == 'week'){
      const now = DayJS(!!user.member.week.end ? new Date(user.member.week.end) : Date.now())
      const end = now.add(7, 'day')

      await DB.User.updateOne({ _id: user._id }, {
        $set: {
          'member.week.enable': true,
          'member.week.end': end,
          'member.week.discount': config.member.week.discount,
        },
        $inc: {
          'member.week.free.lunch': config.member.week.free.lunch,
          'member.week.free.time': config.member.week.free.time,
          'statistic.pay': realMoney,
          'statistic.payweek': realMoney,
        }
      })
    }

    if(order.type == 'month'){
      const now = DayJS(!!user.member.month.end ? new Date(user.member.month.end) : Date.now())
      const end = now.add(30, 'day')

      await DB.User.updateOne({ _id: user._id }, {
        $set: {
          'member.week.enable': false,
          'member.week.end': null,
          'member.week.discount': 0,
          'member.week.free.lunch': 0,
          'member.week.free.time': 0,
          'member.month.enable': true,
          'member.month.end': end,
          'member.month.discount': config.member.month.discount,
        },
        $inc: {
          'member.month.free.lunch': config.member.month.free.lunch + user.member.week.free.lunch,
          'member.month.free.time': config.member.month.free.time + user.member.week.free.time,
          'statistic.pay': realMoney,
          'statistic.payweek': realMoney,
        }
      })
    }

    // Update User Statistic
    order.price > 0 && await DB.User.updateOne({ _id: user._id }, { $inc: {
      'statistic.pay': order.price
    }})

    // Send Tele
    !!config.telegram.member && await sendTele({
      url: config.telegram.member,
      message: `
        Xác Nhận Đăng Ký Hội Viên Thành Công
        » Mã đơn: ${order.code}
        » Cần thanh toán: ${order.price.toLocaleString('vi-VN')}
        » Đã thanh toán: ${realMoney.toLocaleString('vi-VN')}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })
  }
  else {
    // Send Tele
    !!config.telegram.member && await sendTele({
      url: config.telegram.member,
      message: `
        Đơn Đăng Ký Hội Viên Bị Từ Chối
        » Mã đơn: ${order.code}
        » Cần thanh toán: ${order.price.toLocaleString('vi-VN')}
        » Đã thanh toán: ${realMoney.toLocaleString('vi-VN')}
        » Lý do: ${realReason}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })
  }
}