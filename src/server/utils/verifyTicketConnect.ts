import type { Types } from 'mongoose'
import type { IDBConfig, IDBTicket, IDBLakeArea, IDBLakeSpot, IDBTicketConnect, IDBUser, IDBConfigShift } from '~~/types'

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
  const config = await DB.Config.findOne({}).select('telegram time') as IDBConfig
  if(!config) throw 'Hệ thống chưa sẵn sàng'

  // Get Order
  const order = await DB.TicketConnect.findOne({ code: code }) as IDBTicketConnect
  if(!order) throw 'Giao dịch không tồn tại'
  if(order.status > 0) throw 'Không thể thao tác trên giao dịch này'

  // Set Real Value
  const realMoney = status == 1 ? parseInt(String(money)) : 0
  const realStatus = (status == 1 && realMoney < order.total) ? 2 : status
  const realReason = (status == 1 && realMoney < order.total) ? 'Số tiền không đủ' : reason || 'Giao dịch không hợp lệ'

  // Get Ticket
  const ticket = await DB.Ticket.findOne({ _id: order.ticket }).select('code area spot status cancel time') as IDBTicket
  if(!ticket) throw 'Vé này không còn tồn tại'
  if(realStatus == 1 && ticket.status != 2) throw 'Không thể thao tác trên vé câu này'
  if(realStatus == 1 && !!ticket.cancel.status) throw 'Vé câu đã bị hủy'

  // Get Area
  const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('name') as IDBLakeArea
  if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

  // Get Spot
  const spotCheck = await DB.LakeSpot.findOne({ _id: ticket.spot }).select('code') as IDBLakeSpot
  if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'

  // Get New Shift
  const shift = await DB.ConfigShift.findOne({ _id: order.new }).select('duration') as IDBConfigShift
  if(!shift) throw 'Không tìm thấy ca câu mới'

  // Update Order
  const time = new Date()
  const timeFormat = formatDate(time)
  const verify_person = !!verifier ? verifier : bot._id
  await DB.TicketConnect.updateOne({ _id: order._id }, {
    $set: {
      status: realStatus,
      money: realMoney,
      'pay.time': time,
      'pay.reason': realReason,
      staff: verify_person
    }
  })

  // Check Status
  if(realStatus == 1){
    const start = new Date(ticket.time.start)
    const end = new Date(start.getTime() + shift.duration * 60 * 60 * 1000)
    const delay = new Date(end.getTime() + config.time.delay * 60 * 1000)

    await DB.Ticket.updateOne({ _id: ticket._id }, {
      $set: {
        shift: order.new,
        'time.end': end,
        'time.delay': delay
      },
      $inc: {
        'price.connect': order.total,
        'price.total': order.total
      }
    })

    // Send Tele
    !!config.telegram.ticket && await sendTele({
      url: config.telegram.ticket,
      message: `
        Đơn Hàng Nối Giờ Câu Được Chấp Thuận
        » Khu vực: ${areaCheck.name} - ${spotCheck.code}
        » Mã vé: ${ticket.code}
        » Mã đơn: ${order.code}
        » Đã thanh toán: ${order.total.toLocaleString('vi-VN')}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })

    console.log(`
      Đơn Hàng Nối Giờ Câu Được Chấp Thuận
      » Khu vực: ${areaCheck.name} - ${spotCheck.code}
      » Mã vé: ${ticket.code}
      » Mã đơn: ${order.code}
      » Đã thanh toán: ${order.total.toLocaleString('vi-VN')}
      » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
    `)
  }
  else {
    // Send Tele
    !!config.telegram.ticket && await sendTele({
      url: config.telegram.ticket,
      message: `
        Đơn Hàng Nối Giờ Câu Bị Từ Chối
        » Khu vực: ${areaCheck.name} - ${spotCheck.code}
        » Mã vé: ${ticket.code}
        » Mã đơn: ${order.code}
        » Lý do: ${realReason}
        » Thời gian: ${timeFormat.day}/${timeFormat.month}/${timeFormat.year} - ${timeFormat.hour}:${timeFormat.minute}
      `
    })
  }
}