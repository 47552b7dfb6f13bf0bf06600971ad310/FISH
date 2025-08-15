import type { IDBConfig, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { money, code, key } = query
    if(!money || !code || !key) throw 'Không có quyền quy cập'

    // Get Config
    const config = await DB.Config.findOne({}).select('gate') as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình trang'
    if(config.gate.secret != key) throw 'Khóa bí mật không chính xác'

    // Get Ticket
    const realCode = (code as string).trim().replace(/\s/g, '').toUpperCase()
    const ticket = await DB.Ticket.findOne({ code: realCode }).select('code') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé'
    
    await verifyTicketSuccess({
      code: ticket.code,
      money: Number(money)
    })

    setResponseStatus(event, 200)
    return { message: 'Xử lý thành công' }
  } 
  catch (e:any) {
    setResponseStatus(event, 500)
    return { message: e.toString() }
  }
})