import type { IAuth, IDBConfig, IDBTicket } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const config = await DB.Config.findOne().select('lunch') as IDBConfig
    if(!config) throw 'Hệ thống chưa sẵn sàng'

    const ticket = await DB.Ticket.findOne({ code: code }).select('code lunch status cancel') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(!!ticket.lunch.has) throw 'Vé này đã đăng ký cơm'

    await DB.Ticket.updateOne({ _id: ticket._id }, { 
      $set: {
        'lunch.has': true,
        'lunch.complete': false,
        'price.lunch': config.lunch.price
      },
      $inc: {
        'price.total': config.lunch.price
      }
    })

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})