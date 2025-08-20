import type { IDBUser } from "~~/types"

export default async (now : Date)  => {
  const tickets = await DB.Ticket.find({
    'status': 0,
    'cancel.status': false,
    'time.pay': { $lt: now }
  }).select('spot code')

  const bot = await DB.User.findOne({ phone: 'bot' }).select('_id') as IDBUser
  const listTicketCancel = tickets.map(i => i._id)
  const listSpotUpdate = tickets.map(i => i.spot)

  if(listTicketCancel.length > 0) {
    await DB.Ticket.updateMany(
      { _id: { $in: listTicketCancel }}, 
      { $set: {
        'cancel.staff': bot._id,
        'cancel.status': true
      }}
    )

    await DB.TicketOrder.updateMany(
      { ticket: { $in: listTicketCancel }},
      { $set: {
        'staff': bot._id,
        'status': 2
      }}
    )
  }
  
  listSpotUpdate.length > 0 && await DB.LakeSpot.updateMany(
    { _id: { $in: listSpotUpdate }}, 
    { $set: { 'status': 0 }}
  )
}