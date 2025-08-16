import type { IDBConfig, IDBTicketConnect } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const { money, code, key } = query
    if(!money || !code || !key) throw 'Không có quyền quy cập'

    // Get Config
    const config = await DB.Config.findOne({}).select('gate') as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình trang'
    if(config.gate.secret != key) throw 'Khóa bí mật không chính xác'

    // Get Payment
    const realCode = (code as string).trim().replace(/\s/g, '').toUpperCase()
    const order = await DB.TicketConnect.findOne({ code: realCode }).select('code') as IDBTicketConnect
    if(!order) throw 'Giao dịch không tồn tại'
    
    // Verify
    await verifyTicketConnect({
      code: order.code,
      status: 1,
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