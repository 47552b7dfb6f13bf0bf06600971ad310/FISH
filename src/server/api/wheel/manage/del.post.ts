import type { IAuth, IDBWheel } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Bạn không phải quản trị viên cấp cao'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const wheelItem = await DB.Wheel.findOne({ _id: _id }).select('_id') as IDBWheel
    if(!wheelItem) throw 'Vật phẩm không tồn tại'

    await DB.Wheel.deleteOne({ _id: _id })
    return resp(event, { message: 'Xóa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})