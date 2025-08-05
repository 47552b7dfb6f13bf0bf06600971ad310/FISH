import type { IAuth, IDBFishCategory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, name } = body
    if(!_id || !name) throw 'Dữ liệu đầu vào không hợp lệ'

    const category = await DB.FishCategory.findOne({ _id: _id }).select('name') as IDBFishCategory
    if(!category) throw 'Danh mục không tồn tại'

    if(category.name != name){
      const key = formatVNString(name, '-')
      const getByKey = await DB.FishCategory.findOne({ key: key }).select('_id') as IDBFishCategory
      if(!!getByKey) throw 'Tên danh mục đã tồn tại'
      body.key = key
    }

    delete body['_id']
    await DB.FishCategory.updateOne({ _id: _id }, body)
    
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})