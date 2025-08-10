import { IAuth, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã ô câu'

    const auth = await getAuth(event, false) as IAuth | null
    if(!auth) throw 'Ô này không thể chọn'
    
    const spot = await DB.LakeSpot.findOne({ code: code }).select('status') as IDBLakeSpot
    if(!spot) throw 'Ô không tồn tại'
    if(spot.status == 0) throw 'Vui lòng tải lại trang'

    const ticket = await DB.Ticket.findOne({ 'spot': spot._id, 'cancel.status': false }).select('user code') as IDBTicket
    if(!ticket) throw 'Ô lỗi, vui lòng chọn ô khác'
    if(auth._id.toString() != ticket.user.toString()) throw 'Ô này không thể chọn'

    return resp(event, { result: ticket.code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})