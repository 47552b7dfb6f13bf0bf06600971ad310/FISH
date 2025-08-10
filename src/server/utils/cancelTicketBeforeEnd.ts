import type { IDBUser } from "~~/types"

export default async (now : Date)  => {
  const tickets = await DB.Ticket.find({
    'status': 3,
    'cancel.status': false,
    'time.delay': { $lt: now }
  }).select('spot code')

  const bot = await DB.User.findOne({ phone: 'bot' }).select('_id') as IDBUser
  const listTicketCancel = tickets.map(i => i._id)
  const listSpotUpdate = tickets.map(i => i.spot)

  listTicketCancel.length > 0 && await DB.Ticket.updateMany(
    { _id: { $in: listTicketCancel }}, 
    { $set: { 
      'cancel.staff': bot._id,
      'cancel.status': true, 
      'status': 4 
    }}
  )

  listSpotUpdate.length > 0 && await DB.LakeSpot.updateMany(
    { _id: { $in: listSpotUpdate }}, 
    { $set: { 'status': 0 }}
  )
}