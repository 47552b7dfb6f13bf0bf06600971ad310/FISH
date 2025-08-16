import type { IAuth, IDBUserMember } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { order : code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã giao dịch'

    const order = await DB.UserMember.findOne({ user: auth._id, code: code }).select('status code') as IDBUserMember
    if(!order) throw 'Giao dịch không tồn tại hoặc bạn không phải chủ giao dịch'
    if(order.status > 0) throw 'Không thể hủy giao dịch này'

    await verifyUserMember({
      code: order.code,
      status: 2,
      reason: 'Khách hàng hủy'
    }, auth._id)

    return resp(event, { message: 'Hủy vé thành công' })
  }
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})