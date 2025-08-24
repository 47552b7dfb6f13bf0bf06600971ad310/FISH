import type { IAuth, IDBTicket, IDBTicketOrder } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Chức năng chỉ dành cho nhân viên'

    const { ticket: ticketCode, connect: connectCode } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé'
    if(!connectCode) throw 'Không tìm mã giao dịch'

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('user code') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'

    const connect = await DB.TicketConnect.findOne({ ticket: ticket._id, code: connectCode }).select('code status total pay') as IDBTicketOrder
    if(!connect) throw 'Đơn hàng còn tồn tại'
    if(connect.status > 0) throw 'Không thể thao tác trên đơn này'
    if(auth.type < 2 && connect.pay.type == 'BANK') throw 'Đơn chuyển khoản, vui lòng đưa QR cho khách để quyét, hệ thống tự động xác nhận'

    await verifyTicketConnect({
      code: connect.code,
      status: 1,
      money: connect.total
    }, auth._id)
    
    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})