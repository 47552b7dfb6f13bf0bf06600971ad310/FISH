import type { IAuth, IDBSpend } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const spend = await DB.Spend.findOne({ _id: _id }).select('title') as IDBSpend
    if(!spend) throw 'Mục chi tiêu không tồn tại'
    
    await DB.Spend.deleteOne({ _id: _id })

    return resp(event, { message: 'Xóa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})