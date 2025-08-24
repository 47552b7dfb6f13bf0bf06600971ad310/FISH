import type { IAuth, IDBTicket, IDBTicketOrder, IDBLakeArea, IDBLakeSpot } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { ticket: ticketCode, connect: connectCode } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé'
    if(!connectCode) throw 'Không tìm mã giao dịch'

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('area spot user code') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'

    const areaCheck = await DB.LakeArea.findOne({ _id: ticket.area }).select('name') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: ticket.spot }).select('code') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'

    const connect = await DB.TicketConnect.findOne({ ticket: ticket._id, code: connectCode }).select('code status user') as IDBTicketOrder
    if(!connect) throw 'Đơn hàng còn tồn tại'
    if(connect.status > 0) throw 'Không thể thao tác trên đơn này'
    if(connect.user.toString() != auth._id.toString()) 'Bạn không phải chủ giao dịch'

    await verifyTicketConnect({
      code: connect.code,
      status: 2,
      reason: 'Khách hàng hủy'
    })

    await talk([`${areaCheck.name}`, `${spotCheck.code}`, 'hủy đơn nối ca'])
    
    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})