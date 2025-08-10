import cron from 'node-cron'

export default defineNitroPlugin(() => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    await cancelTicketPendingPay(now)
    await setTicketBeforeEnd(now)
    await cancelTicketBeforeEnd(now)
  })
})