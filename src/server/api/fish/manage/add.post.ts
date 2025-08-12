import type { IAuth, IDBFishCategory, IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { area, category, amount, kg, time, price } = body
    if(!area || !category || !amount || !kg) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!isNumber(amount) || amount < 1) throw 'Số lượng không hợp lệ'
    if(!isNumber(kg) || kg < 1) throw 'Khối lượng không hợp lệ'
    if(!isNumber(price) || price < 1) throw 'Đơn giá không hợp lệ'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Khu vực không tồn tại'

    const categoryCheck = await DB.FishCategory.findOne({ _id: category }).select('_id name') as IDBFishCategory
    if(!categoryCheck) throw 'Danh mục không tồn tại'

    if(!time) body['time'] = new Date()
    await DB.Fish.create(body)
    return resp(event, { message: 'Nhập thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})