import type { IAuth, IDBItemCategory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { name } = body
    if(!name) throw 'Dữ liệu đầu vào không hợp lệ'

    const key = formatVNString(name, '-')
    const getByKey = await DB.ItemCategory.findOne({ key: key }).select('_id') as IDBItemCategory
    if(!!getByKey) throw 'Tên danh mục đã tồn tại'

    body.key = key
    await DB.ItemCategory.create(body)

    return resp(event, { message: 'Thêm thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})