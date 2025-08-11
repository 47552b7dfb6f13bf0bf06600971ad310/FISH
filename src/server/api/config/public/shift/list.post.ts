export default defineEventHandler(async (event) => {
  try {
    const { area } = await readBody(event)
    if(!area) throw 'Không tìm thấy thông tin khu vực hồ'

    const list = await DB.ConfigShift.find({ area: area, display: true })
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})