import { IDBConfig } from "~~/types"


export default defineEventHandler(async (event) => {
  try {
    const { area } = await readBody(event)
    if(!area) throw 'Không tìm thấy thông tin khu vực hồ'

    const config = await DB.Config.findOne().select('time') as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình'

    const match :any = { area: area, display: true, isNight: false }

    const startNight = config.time.night.start
    const endNight = config.time.night.end
    if(!!startNight && !!endNight){
      const isNight = isInTime(startNight, endNight)
      if(!!isNight) match['isNight'] = true
    }

    const list = await DB.ConfigShift.find(match)
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})