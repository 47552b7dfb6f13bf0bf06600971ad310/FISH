import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { size, current, sort, search } = await readBody(event)
    if(!size || !current || !search || !sort) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = {}
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = {}
    if(!!search.key){
      if(search.by == 'USER'){
        const users = await DB.User.find({
          $or: [
            { phone : { $regex : search.key.toLowerCase(), $options : 'i' } },
            { email : { $regex : search.key.toLowerCase(), $options : 'i' } },
            { key : { $regex : search.key.toLowerCase(), $options : 'i' } },
          ]
        }).select('_id')
      
        match['user'] = { $in: users.map(i => i._id) }
      }
      if(search.by == 'STAFF'){
        const users = await DB.User.find({
          $or: [
            { phone : { $regex : search.key.toLowerCase(), $options : 'i' } },
            { email : { $regex : search.key.toLowerCase(), $options : 'i' } },
            { key : { $regex : search.key.toLowerCase(), $options : 'i' } },
          ]
        }).select('_id')
      
        match['staff'] = { $in: users.map(i => i._id) }
      }
      if(search.by == 'TICKET'){
        const tickets = await DB.Ticket.find({
          code: { $regex : search.key.toLowerCase(), $options : 'i' }
        }).select('_id')
      
        match['ticket'] = { $in: tickets.map(i => i._id) }
      }
      if(search.by == 'CODE'){
        match['code'] = { $regex : search.key.toLowerCase(), $options : 'i' }
      }
    }

    const list = await DB.TicketConnect
    .find(match)
    .populate({ path: 'ticket', select: 'code' })
    .populate({ path: 'user', select: 'phone name' })
    .populate({ path: 'staff', select: 'phone name' })
    .populate({ path: 'old', select: 'duration' })
    .populate({ path: 'new', select: 'duration' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.TicketConnect.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})