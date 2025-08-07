import type { IAuth, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event, false) as IAuth | null
    if(!auth) throw true

    const ticket = await DB.Ticket.findOne({ user: auth._id, cancel: false }).select('user code') as IDBTicket
    if(!ticket) throw true

    return resp(event, { result: ticket.code })
  } 
  catch (e:any) {
    return resp(event, { result: null })
  }
})