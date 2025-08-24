import type { IAuth, IDBTicket, IDBConfig } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Bạn không có quyền thao tác'

    const { code, minus } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'
    if(!minus) throw 'Vui lòng chọn số tiếng trừ'

    const config = await DB.Config.findOne().select('time') as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình trang'

    const ticket = await DB.Ticket.findOne({ code: code }).select('cancel time') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    const oldEnd = new Date(ticket.time.end)
    const newEnd = new Date(oldEnd.getTime() - Number(minus) * 60 * 60 * 1000)
    const newDelay = new Date(newEnd.getTime() + config.time.delay * 60 * 1000)

    ticket.time.end = newEnd
    ticket.time.delay = newDelay
    await ticket.save()

    return resp(event, { message: `Thao tác thành công` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})