export default async (now : Date)  => {
  const tickets = await DB.Ticket.find({
    'status': 2,
    'cancel.status': false,
    'time.end': { $lt: now }
  }).select('spot code')

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
}