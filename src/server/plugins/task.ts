import cron from 'node-cron'

export default defineNitroPlugin(() => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    await delTicketPending(now)
    await cancelTicketEnd(now)
  })
})