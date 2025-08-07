import { IAuth, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('cancel status shift total spot') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé'
    if(!!ticket.cancel) throw 'Vé đã bị hủy'
    if(ticket.status > 0) throw 'Không thể thao tác trên vé này'

    const shift = await DB.ConfigShift.findOne({ _id: ticket.shift }).select('duration') as IDBConfigShift
    if(!shift) throw 'Không tìm thấy thời gian ca câu'

    const start = Date.now()
    const end = new Date(start + shift.duration * 60 * 60 * 1000)

    await DB.Ticket.updateOne({ _id: ticket._id }, {
      start: start,
      end: end,
      pay: {
        total: ticket.total,
        pending: null
      },
      complete: {
        pay: {
          total: true,
          pending: true,
          staff: auth._id
        }
      },
      status: 1
    })

    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 2 })

    return resp(event, { message: 'Thao tác thánh công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})