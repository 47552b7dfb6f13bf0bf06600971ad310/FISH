import type { IAuth, IDBItemCategory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const category = await DB.ItemCategory.findOne({ _id: _id }).select('name') as IDBItemCategory
    if(!category) throw 'Danh mục không tồn tại'
    
    const items = await DB.Item.count({ category: _id })
    if(items > 0) throw 'Không thể xóa danh mục đã có dư liệu nhập sản phẩm'

    await DB.ItemCategory.deleteOne({ _id: _id })
    return resp(event, { message: 'Xóa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})