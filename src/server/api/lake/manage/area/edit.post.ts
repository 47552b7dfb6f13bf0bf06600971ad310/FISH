import type { IAuth, IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, name } = body
    if(!_id || !name) throw 'Dữ liệu đầu vào không hợp lệ'

    const area = await DB.LakeArea.findOne({ _id: _id }).select('name') as IDBLakeArea
    if(!area) throw 'Khu vực hồ không tồn tại'

    if(area.name != name){
      const key = formatVNString(name, '-')
      const getByKey = await DB.LakeArea.findOne({ key: key }).select('_id') as IDBLakeArea
      if(!!getByKey) throw 'Tên khu vực đã tồn tại'
      body.key = key
    }

    delete body['_id']
    await DB.LakeArea.updateOne({ _id: _id }, body)
    
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})