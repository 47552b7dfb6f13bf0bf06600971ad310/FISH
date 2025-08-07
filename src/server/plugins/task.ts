import cron from 'node-cron'

export default defineNitroPlugin(() => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    const tickets = await DB.Ticket.find({
      'status': 0,
      'cancel': false,
      'pay.pending': { $lt: now }
    }).select('spot code')

    const listTicketDel = tickets.map(i => i._id)
    const listSpotUpdate = tickets.map(i => i.spot)
    listTicketDel.length > 0 && await DB.Ticket.updateMany({ _id: { $in: listTicketDel }}, { cancel: true, status: 2 })
    listSpotUpdate.length > 0 && await DB.LakeSpot.updateMany({ _id: { $in: listSpotUpdate }}, { status: 0 })
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  })
})