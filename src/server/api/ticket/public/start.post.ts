import type { IAuth, IDBTicket, IDBConfigShift } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('cancel status shift spot') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.status == 0) throw 'Vé câu chưa được xác nhận đã thanh toán'

    const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
    if(!shift) throw 'Không tìm thấy thời gian ca câu'

    const start = new Date();
    const end = new Date(start.getTime() + shift.duration * 60 * 60 * 1000)
    const delay = new Date(end.getTime() + 5 * 60 * 1000)

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'time.start': start,
      'time.end': end,
      'time.delay': delay,
      'status': 2
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 3 })

    return resp(event, { result: true })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})