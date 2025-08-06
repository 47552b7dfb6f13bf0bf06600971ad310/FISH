import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code, user: auth._id }).select('cancel code spot') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel) throw 'Vé này đã bị hủy'

    ticket.cancel = true
    await ticket.save()
    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })

    return resp(event, { message: `Đã hủy vé ${ticket.code}` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})