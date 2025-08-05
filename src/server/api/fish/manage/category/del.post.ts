import type { IAuth, IDBFishCategory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const category = await DB.FishCategory.findOne({ _id: _id }).select('name') as IDBFishCategory
    if(!category) throw 'Danh mục không tồn tại'
    
    const fishs = await DB.Fish.count({ category: _id })
    if(fishs > 0) throw 'Không thể xóa danh mục đã có dư liệu nhập cá'

    await DB.FishCategory.deleteOne({ _id: _id })
    return resp(event, { message: 'Xóa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})