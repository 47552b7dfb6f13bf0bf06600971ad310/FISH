import type { IAuth, IDBItem, IDBItemCategory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { category, name, price } = body
    if(!category || !name || !price) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!isNumber(price) || price < 0) throw 'Giá bán không hợp lệ'

    const categoryCheck = await DB.ItemCategory.findOne({ _id: category }).select('_id name') as IDBItemCategory
    if(!categoryCheck) throw 'Danh mục không tồn tại'

    const key = formatVNString(name, '-')
    const getByKey = await DB.Item.findOne({ key: key, category: categoryCheck._id }).select('_id') as IDBItem
    if(!!getByKey) throw 'Tên sản phẩm đã tồn tại'

    body.key = key
    await DB.Item.create(body)
    return resp(event, { message: 'Nhập thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})