import type { IAuth, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { _id, ticket: ticketID } = await readBody(event)
    if(!_id) throw 'Không tìm ID ô câu'
    if(!ticketID) throw 'Không tìm ID vé câu'

    const ticket = await DB.Ticket.findOne({ _id: ticketID }).select('status cancel spot') as IDBTicket
    if(!ticket) throw 'Vé này không tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'

    const nowSpot = await DB.LakeSpot.findOne({ _id: ticket.spot }) as IDBLakeSpot
    if(!nowSpot) throw 'Không tìm thấy thông tin ô hiện tại'

    const spot = await DB.LakeSpot.findOne({ _id: _id }) as IDBLakeSpot
    if(!spot) throw 'Không tìm thấy thông tin ô đổi'
    if(spot._id.toString() == ticket.spot.toString()) throw 'Không thể đổi sang ô câu hiện tại'
    if(spot.status > 0) throw 'Ô này đã có người đặt'

    ticket.spot = spot._id
    spot.status = nowSpot.status
    nowSpot.status = 0

    await ticket.save()
    await spot.save()
    await nowSpot.save()

    return resp(event, { result: ticket })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})