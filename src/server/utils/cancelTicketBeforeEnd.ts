import { Types } from "mongoose"
import type { IDBUser } from "~~/types"

export default async (now : Date)  => {
  const tickets = await DB.Ticket.find({
    'status': 4,
    'cancel.status': false,
    'time.delay': { $lt: now }
  }).select('spot code user fish')

  const bot = await DB.User.findOne({ phone: 'bot' }).select('_id') as IDBUser
  const listTicketCancel = tickets.map(i => i._id)
  const listSpotUpdate = tickets.map(i => i.spot)
  const listUserMissFish = [
    ...new Set(
      tickets
        .filter(i => i.fish?.amount == 0)
        .map(i => i.user.toString())
    )
  ].map(id => new Types.ObjectId(id))
  const listUserHasFiss = [
    ...new Set(
      tickets
        .filter(i => i.fish?.amount > 0)
        .map(i => i.user.toString())
    )
  ].map(id => new Types.ObjectId(id))

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

  listUserMissFish.length > 0 && await DB.User.updateMany(
    { _id: { $in: listUserMissFish }}, 
    { $inc: { 'statistic.miss': 1 }}
  )

  listUserHasFiss.length > 0 && await DB.User.updateMany(
    { _id: { $in: listUserHasFiss }}, 
    { $set: { 'statistic.miss': 0 }}
  )
}