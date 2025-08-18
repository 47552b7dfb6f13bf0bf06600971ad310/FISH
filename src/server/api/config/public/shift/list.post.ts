import { IDBConfig } from "~~/types"

function toMinutes(hhmm : any) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function isInNight(startStr : any, endStr : any) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const start = toMinutes(startStr);
  const end = toMinutes(endStr);

  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  } else {
    return nowMinutes >= start || nowMinutes < end;
  }
}

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
      const isNight = isInNight(startNight, endNight)
      if(!!isNight) match['isNight'] = true
    }

    const list = await DB.ConfigShift.find(match)
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})