import type { IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { area } = await readBody(event)
    if(!area) throw 'Không tìm thấy thông tin khu vực'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy thông tin khu vực'

    const list = await DB.LakeSpot.find({ status: 0 })
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})