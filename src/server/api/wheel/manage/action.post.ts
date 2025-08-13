import type { IAuth, IDBWheel, IDBWheelHistory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Bạn không phải quản trị viên cấp cao'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const history = await DB.WheelHistory.findOne({ _id: _id }).select('received giver') as IDBWheelHistory
    if(!history) throw 'Lịch sử quay không tồn tại'
    if(!!history.received) throw 'Quà này đã được trao'

    history.received = true
    history.giver = auth._id

    // @ts-expect-error
    await history.save()

    return resp(event, { message: 'Cập nhật thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})