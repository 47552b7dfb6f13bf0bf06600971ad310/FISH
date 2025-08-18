import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event, false) as IAuth | null
    if(!auth) throw true

    const ticket = await DB.Ticket.findOne({ 
      'user': auth._id, 
      'cancel.status': false 
    })
    .populate({ path: 'area', select: 'name' })
    .populate({ path: 'spot', select: 'code' })
    .select('code status time') as IDBTicket
    if(!ticket) throw true

    return resp(event, { result: ticket })
  } 
  catch (e:any) {
    return resp(event, { result: null })
  }
})