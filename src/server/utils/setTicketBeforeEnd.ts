import { IDBConfig } from "~~/types"

export default async (now : Date)  => {
  const tickets = await DB.Ticket.find({
    'status': 2,
    'cancel.status': false,
    'time.end': { $lt: now }
  })
  .select('area spot code')
  .populate({ path: 'area', select: 'name' })
  .populate({ path: 'spot', select: 'code' })

  const config = await DB.Config.findOne({}).select('telegram') as IDBConfig
  const listTele = tickets.map((item : any) => {
    return `${item.area.name} - ${item.spot.code}`
  })
  const listTicketCancel = tickets.map(i => i._id)
  const listSpotUpdate = tickets.map(i => i.spot)

  listTicketCancel.length > 0 && await DB.Ticket.updateMany(
    { _id: { $in: listTicketCancel }}, 
    { $set: { 'status': 3 }}
  )

  listSpotUpdate.length > 0 && await DB.LakeSpot.updateMany(
    { _id: { $in: listSpotUpdate }}, 
    { $set: { 'status': 4 }}
  )

  // Update Lake Info
  listTicketCancel.length > 0 && await socketUpdateLakeInfo()

  if(!!config && !!config.telegram.ticket && listTele.length > 0) await sendTele({
    url: config.telegram.ticket,
    message: `Các Ô Đã Hết Giờ Câu\n${listTele.join('\n')}`
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
    const txt =  [...['Các ô đã hết giờ câu', item.area], ...item.spots]
    await talk(txt)
  })
}