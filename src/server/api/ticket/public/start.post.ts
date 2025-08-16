import type { IAuth, IDBConfig, IDBTicket, IDBConfigShift } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const config = await DB.Config.findOne({}).select('time') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('cancel status shift spot code user') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    
    return resp(event, { result: true })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})