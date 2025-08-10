import type { IAuth, IDBTicket } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('code lunch status complete') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(ticket.status == 0) throw 'Vé này chưa thanh toán'
    if(!ticket.lunch.has) throw 'Vé này không đăng ký cơm'
    if(!!ticket.lunch.complete) throw 'Vé này đã được giao cơm'

    await DB.Ticket.updateOne({ _id: ticket._id }, { 
      $set: {
        'lunch.staff': auth._id,
        'lunch.complete': true,
      }
    })

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})