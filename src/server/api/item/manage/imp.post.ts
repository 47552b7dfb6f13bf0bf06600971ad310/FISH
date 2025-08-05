import type { IAuth, IDBItem } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, data } = body
    if(!_id || !data) throw 'Dữ liệu đầu vào không hợp lệ'
    const { amount, price, note } = data
    if(!isNumber(amount) || amount < 1) throw 'Số lượng không hợp lệ'
    if(!isNumber(price) || price < 1) throw 'Giá nhập không hợp lệ'

    const item = await DB.Item.findOne({ _id: _id }).select('category') as IDBItem
    if(!item) throw 'Sản phẩm đã tồn tại'

    await DB.ItemImport.create({
      user: auth._id,
      category: item.category,
      item: item._id,
      amount: amount,
      price: price,
      note: note,
    })

    await DB.Item.updateOne({ _id: item._id }, { $inc: { 'inventory': amount }})

    return resp(event, { message: 'Nhập thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})