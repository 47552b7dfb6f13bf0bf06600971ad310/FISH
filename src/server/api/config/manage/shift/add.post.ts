import type { IAuth, IDBConfigShift, IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { area, name, duration, price } = body
    if(!area || !name) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!isNumber(duration) || duration < 1) throw 'Thời lượng không hợp lệ'
    if(!isNumber(price) || price < 1) throw 'Giá không hợp lệ'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const key = formatVNString(name, '-')
    const getByKey = await DB.ConfigShift.findOne({ key: key, area: areaCheck._id }).select('_id') as IDBConfigShift
    if(!!getByKey) throw 'Tên ca câu đã tồn tại'

    body.key = key
    body.area = areaCheck._id
    await DB.ConfigShift.create(body)

    return resp(event, { message: 'Thêm thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})