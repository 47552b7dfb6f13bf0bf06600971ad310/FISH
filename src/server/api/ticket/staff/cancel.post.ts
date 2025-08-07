import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền thao tác'

    const { code } = await readBody(event)
    if(!code) throw 'Không tìm thấy mã vé'

    const ticket = await DB.Ticket.findOne({ code: code }).select('cancel complete code spot status') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel) throw 'Vé này đã bị hủy'

    if(ticket.status > 0 && auth.type < 3) throw 'Bạn không có quyền thao tác hủy với vé đã thanh toán'

    await DB.Ticket.updateOne({ _id: ticket._id }, {
      complete: {
        cancel: auth._id
      },
      cancel: true
    })

    await DB.LakeSpot.updateOne({ _id: ticket.spot }, { status: 0 })
    return resp(event, { message: `Thao tác thành công` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})