import type { IAuth, IDBConfigShift } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const shift = await DB.ConfigShift.findOne({ _id: _id }).select('_id') as IDBConfigShift
    if(!shift) throw 'Ca câu không tồn tại'
    
    const ticket = await DB.Ticket.count({ shift: shift._id })
    if(ticket > 0) throw 'Không thể xóa ca câu đã có dũ liệu khách hàng'

    await DB.ConfigShift.deleteOne({ _id: shift._id })
    return resp(event, { message: 'Xóa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})