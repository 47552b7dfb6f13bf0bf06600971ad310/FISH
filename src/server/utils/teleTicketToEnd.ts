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
  const list = tickets.map((item : any) => {
    return `${item.area.name} - ${item.spot.code}`
  })

  if(!!config && !!config.telegram.ticket && list.length > 0) await sendTele({
    url: config.telegram.ticket,
    message: `
      Các Vé Câu Sắp Hết Giờ
      ${list.join('\n')}
    `
  })
}