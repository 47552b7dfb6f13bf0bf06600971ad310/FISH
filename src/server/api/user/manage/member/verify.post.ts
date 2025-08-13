import type { IAuth, IDBUserMember } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 2) throw 'Chỉ quản trị viên mới có thể thao tác'

    const { _id, status, reason } = await readBody(event)
    if(!_id) throw 'Không tìm thấy ID giao dịch'
    if(status < 1 || status > 2) throw 'Trạng thái giao dịch không hợp lệ'

    const order = await DB.UserMember.findOne({ _id: _id }).select('status code price') as IDBUserMember
    if(!order) throw 'Giao dịch không tồn tại'
    if(order.status > 0) throw 'Không thể thao tác với giao dịch này'

    await verifyUserMember({
      code: order.code,
      status: status,
      money: order.price,
      reason: reason
    }, auth._id)

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})