import type { IAuth, IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const { _id } = await readBody(event)
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const area = await DB.LakeArea.findOne({ _id: _id }).select('name') as IDBLakeArea
    if(!area) throw 'Khu vực hồ không tồn tại'
    
    const spots = await DB.LakeSpot.count({ area: _id })
    if(spots > 0) throw 'Không thể xóa khu vực đã có dữ liệu ô câu'

    await DB.LakeArea.deleteOne({ _id: _id })
    return resp(event, { message: 'Xóa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})