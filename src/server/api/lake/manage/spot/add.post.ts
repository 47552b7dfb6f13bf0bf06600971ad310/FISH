import type { IAuth, IDBLakeArea, IDBLakeSpot } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { area, code } = body
    if(!area || !code) throw 'Dữ liệu đầu vào không hợp lệ'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Khu vực hồ không tồn tại'

    const getByCode = await DB.LakeSpot.findOne({ code: code, area: areaCheck._id }).select('_id') as IDBLakeSpot
    if(!!getByCode) throw 'Mã ô câu đã tồn tại'

    await DB.LakeSpot.create(body)
    return resp(event, { message: 'Thêm thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})