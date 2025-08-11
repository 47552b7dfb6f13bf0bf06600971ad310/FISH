import type { IAuth, IDBConfigShift } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, name, duration, price } = body
    if(!_id || !name) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!isNumber(duration) || duration < 1) throw 'Thời lượng không hợp lệ'
    if(!isNumber(price) || price < 1) throw 'Giá không hợp lệ'

    const shift = await DB.ConfigShift.findOne({ _id: _id }).select('name area') as IDBConfigShift
    if(!shift) throw 'Ca câu không tồn tại'

    if(shift.name != name){
      const key = formatVNString(name, '-')
      const getByKey = await DB.ConfigShift.findOne({ key: key, area: shift.area }).select('_id') as IDBConfigShift
      if(!!getByKey) throw 'Tên ca câu đã tồn tại'
      body.key = key
    }

    delete body['_id']
    delete body['area']
    await DB.ConfigShift.updateOne({ _id: _id }, body)
    
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})