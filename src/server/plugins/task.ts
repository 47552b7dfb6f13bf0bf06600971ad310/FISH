import cron from 'node-cron'

export default defineNitroPlugin(() => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    await cancelTicketPendingPay(now)
    await setTicketBeforeEnd(now)
    await cancelTicketBeforeEnd(now)
  })

  cron.schedule('*/5 * * * *', async () => {
    const now = new Date()
    await teleTicketToEnd(now)
  })

  cron.schedule('0 0 * * 1', async () => {
    await DB.User.updateMany({}, { $set: { 
      'currency.wheel': 0,
      'statistic.payweek': 0,
    }})
  })
})