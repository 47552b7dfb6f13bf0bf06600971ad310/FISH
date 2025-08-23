import { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { ticket : ticketCode } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé câu'

    const config = await DB.Config.findOne().select('time') as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình'

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('area shift user status cancel') as IDBTicket
    if(!ticket) throw 'Vé câu không tồn tại'
    if(!!ticket.cancel.status) throw 'Vé câu đã bị hủy'
    if(ticket.status != 2) throw 'Không thể thao tác trên vé câu này'
    if(ticket.user.toString() != auth._id.toString()) throw 'Bạn không phải chủ vé câu'

    const area = await DB.LakeArea.findOne({ _id: ticket.area }).select('_id') as IDBLakeArea
    if(!area) throw 'Không tìm thấy mã khu vực'

    const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
    if(!shift) throw 'Không tìm thấy thời gian câu hiện tại'

    const connect = await DB.TicketConnect.findOne({ ticket: ticket._id, user: auth._id, status: 0 }) 
    if(!!connect) return resp(event, { result: { connect: connect } })

    const match : any = { 
      area: area._id, 
      display: true,
      isNight: false,
      duration: { "$gt": shift.duration }
    }

    const startNight = config.time.night.start
    const endNight = config.time.night.end
    if(!!startNight && !!endNight){
      const isNight = isInTime(startNight, endNight)
      if(!!isNight) match['isNight'] = true
    }

    const list = await DB.ConfigShift.find(match)
    
    return resp(event, { result: { list: list } })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})