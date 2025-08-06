import cron from 'node-cron'

export default defineNitroPlugin(() => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    const tickets = await DB.Ticket.find({
      'complete.pay.pending': false,
      'pay.pending': { $lt: now }
    }).select('spot')

    const listTicketDel = tickets.map(i => i._id)
    const listSpotUpdate = tickets.map(i => i.spot)
    await DB.Ticket.updateMany({ _id: { $in: listTicketDel }}, { cancel: true })
    await DB.LakeSpot.updateMany({ _id: { $in: listSpotUpdate }}, { status: 0 })
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  })
})