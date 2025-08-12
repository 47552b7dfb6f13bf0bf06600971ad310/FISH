import { IAuth, IDBLakeSpot, IDBTicket, IDBConfig } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { _id } = await readBody(event)
    if(!_id) throw 'Không tìm thấy mã ô câu'

    const auth = await getAuth(event, false) as IAuth | null
    if(!auth) throw 'Vui lòng đăng nhập trước'
    
    const spot = await DB.LakeSpot.findOne({ _id: _id }).select('status') as IDBLakeSpot
    if(!spot) throw 'Ô không tồn tại'
    if(spot.status == 0){
      const config = await DB.Config.findOne({}).select('time') as IDBConfig
      if(!!config.time.create){
        const now = DayJS(Date.now()).unix()
        const create = DayJS(config.time.create).unix()
        if(now < create) throw 'Chưa tới thời gian mở bán vé'
      }

      const ticket = await DB.Ticket.findOne({ 
        'cancel.status': false,
        'user': auth._id
      }).select('code') as IDBTicket
      if(!!ticket) throw 'Bạn đang có 1 vé hoạt động, không thể thuê thêm'
      return resp(event, { result: 'Create' })
    }
    else {
      const ticket = await DB.Ticket.findOne({ 'spot': spot._id, 'cancel.status': false }).select('user code') as IDBTicket
      if(!ticket) throw 'Ô lỗi, vui lòng chọn ô khác'
      if(auth._id.toString() != ticket.user.toString()) throw 'Ô này không thể chọn'
      return resp(event, { result: { ticket: ticket.code } })
    }
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})