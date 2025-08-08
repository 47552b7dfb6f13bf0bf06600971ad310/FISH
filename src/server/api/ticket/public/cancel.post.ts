import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('cancel status complete code spot') as IDBTicket
    if(!ticket) throw 'Không tìm thấy dữ liệu vé câu'
    if(!!ticket.cancel) throw 'Vé này đã bị hủy'
    if(ticket.status > 0) throw 'Không thể hủy vé câu đã thanh toán'

    // Cập nhật trạng thái vé câu
    await DB.Ticket.updateOne({ _id: ticket._id }, { $set: {
      'complete.cancel': auth._id,
      'cancel': true
    }})

    // Cập nhật trạng thái ô câu
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    return resp(event, { message: `Đã hủy vé ${ticket.code}` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})