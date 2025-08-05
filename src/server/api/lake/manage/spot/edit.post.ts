import type { IAuth, IDBLakeSpot } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { _id, code } = body
    if(!_id || !code) throw 'Dữ liệu đầu vào không hợp lệ'

    const spot = await DB.LakeSpot.findOne({ _id: _id }).select('code') as IDBLakeSpot
    if(!spot) throw 'Ô câu không tồn tại'

    if(spot.code != code){
      const getByCode = await DB.LakeSpot.findOne({ code: code }).select('_id') as IDBLakeSpot
      if(!!getByCode) throw 'Mã ô câu đã tồn tại'
    }

    delete body['_id']
    await DB.LakeSpot.updateOne({ _id: _id }, body)
    
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})