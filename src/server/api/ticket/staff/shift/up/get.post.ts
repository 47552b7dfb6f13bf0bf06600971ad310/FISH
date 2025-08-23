import { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBTicket, IDBTicketConnect } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Chức năng chỉ dành cho nhân viên'

    const { ticket : ticketCode } = await readBody(event)
    if(!ticketCode) throw 'Không tìm mã vé câu'

    const config = await DB.Config.findOne().select('time') as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình'

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('area shift user status cancel') as IDBTicket
    if(!ticket) throw 'Vé câu không tồn tại'

    const area = await DB.LakeArea.findOne({ _id: ticket.area }).select('_id') as IDBLakeArea
    if(!area) throw 'Không tìm thấy mã khu vực'

    const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
    if(!shift) throw 'Không tìm thấy thời gian câu hiện tại'

    const connect = await DB.TicketConnect
    .findOne({ ticket: ticket._id, user: ticket.user, status: 0 })
    .populate({ path: 'new' })
    .populate({ path: 'old' }) as IDBTicketConnect
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
    return resp(event, { code: 400, message: e.toString() })
  }
})