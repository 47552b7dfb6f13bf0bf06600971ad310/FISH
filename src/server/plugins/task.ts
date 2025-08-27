import cron from 'node-cron'

export default defineNitroPlugin(() => {
  // Chạy mỗi 1 phút
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    await cancelTicketPendingPay(now)
    await setTicketBeforeEnd(now)
    await cancelTicketBeforeEnd(now)
  })

  // Chạy mỗi 10 phút
  cron.schedule('*/10 * * * *', async () => {
    const now = new Date()
    await teleTicketToEnd(now)
  })

  // Chạy mỗi tuần
  cron.schedule('0 0 * * 1', async () => {
    await DB.User.updateMany({}, { $set: { 
      'currency.wheel': 0,
      'statistic.payweek': 0,
      'charity.week': 0,
    }})
  })

  // Chạy mỗi tháng
  cron.schedule("0 0 1 * *", async () => {
    await DB.User.updateMany({}, { $set: { 
      'charity.month': 0,
    }})
  })
})