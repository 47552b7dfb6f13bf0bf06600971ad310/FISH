import type { IAuth, IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { name } = body
    if(!name) throw 'Dữ liệu đầu vào không hợp lệ'

    const key = formatVNString(name, '-')
    const getByKey = await DB.LakeArea.findOne({ key: key }).select('_id') as IDBLakeArea
    if(!!getByKey) throw 'Tên khu vực hồ đã tồn tại'

    body.key = key
    await DB.LakeArea.create(body)

    return resp(event, { message: 'Thêm thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})