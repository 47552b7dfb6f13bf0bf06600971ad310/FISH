import type { IAuth, IDBUserMember } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { order : code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã giao dịch'

    const order = await DB.UserMember.findOne({ user: auth._id, code: code }).select('status') as IDBUserMember
    if(!order) throw 'Giao dịch không tồn tại hoặc bạn không phải chủ giao dịch'
    if(order.status > 0) throw 'Không thể thao tác trên giao dịch này'

    return resp(event, { message: 'Xác minh thành công, vui lòng đợi tài khoản cập nhật' })
  }
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})