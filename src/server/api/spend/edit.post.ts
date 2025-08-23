import type { IAuth, IDBSpend } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, title, money, reason, images, time } = body
    if(!_id || !title || !reason || !time) throw 'Vui lòng nhập đầy đủ thông tin'
    if(!!isNaN(parseInt(money)) || parseInt(money) < 0) throw 'Dữ liệu tiền tệ không hợp lệ'
    if(!Array.isArray(images)) throw 'Dữ liệu hình ảnh không hợp lệ'

    const spend = await DB.Spend.findOne({ _id: _id }).select('title') as IDBSpend
    if(!spend) throw 'Mục chi tiêu không tồn tại'

    delete body['_id']
    body.time = new Date(time)
    body.user = auth._id
    await DB.Spend.updateOne({ _id: _id }, body)

    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})