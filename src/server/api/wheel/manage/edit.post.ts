import type { IAuth, IDBWheel } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Bạn không phải quản trị viên cấp cao'

    const body = await readBody(event)
    const { _id, name, amount, percent } = body
    if(!_id || !name || !amount) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!!isNaN(parseInt(amount)) || parseInt(amount) < 1) throw 'Số lượng không hợp lệ'
    if(!!isNaN(parseFloat(percent)) || (parseFloat(percent) * -1) > 0) throw 'Tỷ lệ không hợp lệ'

    const wheelItem = await DB.Wheel.findOne({ _id: _id }).select('_id') as IDBWheel
    if(!wheelItem) throw 'Vật phẩm không tồn tại'

    delete body['_id']
    await DB.Wheel.updateOne({ _id: _id }, body)
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})