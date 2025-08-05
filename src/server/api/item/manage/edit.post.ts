import type { IAuth, IDBItem, IDBItemCategory } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, name, price } = body
    if(!_id || !name || !price) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!isNumber(price) || price < 0) throw 'Giá bán không hợp lệ'

    const itemCheck = await DB.Item.findOne({ _id: _id }).select('name') as IDBItem
    if(!itemCheck) throw 'Sản phẩm không tồn tại'

    if(itemCheck.name != name){
      const key = formatVNString(name, '-')
      const getByKey = await DB.Item.findOne({ key: key }).select('_id') as IDBItem
      if(!!getByKey) throw 'Tên sản phẩm đã tồn tại'
      body.key = key
    }

    delete body['_id']
    await DB.Item.updateOne({ _id: _id }, body)
    
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})