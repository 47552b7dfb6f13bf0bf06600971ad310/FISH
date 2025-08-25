import { IDBConfig } from "~~/types"

export default async (now : Date)  => {
  const fifteenMinutesLater = new Date(now.getTime() + 30 * 60 * 1000)

  const tickets = await DB.Ticket.find({
    'status': 2,
    'cancel.status': false,
    'time.end': { $gt: now, $lte: fifteenMinutesLater }
  })
  .select('area spot code')
  .populate({ path: 'area', select: 'name' })
  .populate({ path: 'spot', select: 'code' })

  const config = await DB.Config.findOne({}).select('telegram') as IDBConfig
  const listTele = tickets.map((item : any) => {
    return `${item.area.name} - ${item.spot.code}`
  })

  if(!!config && !!config.telegram.ticket && listTele.length > 0) await sendTele({
    url: config.telegram.ticket,
    message: `Các Ô Sắp Hết Giờ\n${listTele.join('\n')}`
  })

  if(listTele.length > 0) Object.values(
    tickets.reduce((acc, item) => {
      const areaId = item.area._id.toString();
      if (!acc[areaId]) {
        acc[areaId] = { area: item.area.name, spots: [] }
      }
      acc[areaId].spots.push(item.spot.code)
      return acc;
    }, {})
  ).forEach(async (item : any) => {
    const txt =  [...['Các ô sắp hết giờ', item.area], ...item.spots]
    await talk(txt)
  })
}