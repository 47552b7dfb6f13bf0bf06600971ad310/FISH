import { IAuth, IDBConfigShift, IDBTicket, IDBUser } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('user cancel pay shift spot price discount') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé'
    if(!!ticket.cancel.status) throw 'Vé đã bị hủy'
    // if(!!ticket.pay.complete) throw 'Vé này đã được xác nhận thanh toán'

    const user = await DB.User.findOne({ _id: ticket.user }).select('vouchers') as IDBUser
    if(!user) throw 'Không tìm thấy tài khoản khách hàng'

    const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
    if(!shift) throw 'Không tìm thấy thời gian ca câu'

    // Xóa Voucher nếu có
    if(ticket.discount.voucher) await delUserVoucher(user, ticket.discount.voucher)

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'time.pay': null,
      'pay.complete': true,
      'pay.staff': auth._id,
      'status': 1
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 2 })

    return resp(event, { message: 'Thao tác thánh công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})