import type { Types } from 'mongoose'
import { IDBConfigShift, IDBLakeArea, IDBTicket, IDBUser } from "~~/types"

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

  const ticket = await DB.Ticket.findOne({ code: code }).select('area user cancel pay shift spot price pig discount') as IDBTicket
  if(!ticket) throw 'Không tìm thấy dữ liệu vé'
  if(!!ticket.cancel.status) throw 'Vé đã bị hủy'
  if(!!ticket.pay.complete) throw 'Vé này đã được xác nhận thanh toán'

  const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('pig') as IDBLakeArea
  if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

  const user = await DB.User.findOne({ _id: ticket.user }).select('vouchers') as IDBUser
  if(!user) throw 'Không tìm thấy tài khoản khách hàng'

  const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
  if(!shift) throw 'Không tìm thấy thời gian ca câu'

  // Xóa Voucher nếu có
  if(ticket.discount.voucher) await delUserVoucher(user, ticket.discount.voucher)

  // Set Thời gian
  const start = new Date();
  const end = new Date(start.getTime() + shift.duration * 60 * 60 * 1000)
  const delay = new Date(end.getTime() + 5 * 60 * 1000)

  // Cập nhật trạng thái vé câu
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

  // Cập nhật thông số
  if(ticket.price.total > 0) await DB.User.updateOne({ _id: ticket.user }, { $inc: {
    'statistic.pay': ticket.price.total,
    'statistic.payweek': ticket.price.total,
  }})

  // Cập nhật Heo
  if(ticket.price.total > 0 && ticket.price.pig > 0) {
    await DB.LakeArea.updateOne({ _id: areaCheck._id }, { $inc: {
      'pig.money': areaCheck.pig.max
    }})
    await ticket.save()
  }

  // Update Lake Info
  await socketUpdateLakeInfo()
}