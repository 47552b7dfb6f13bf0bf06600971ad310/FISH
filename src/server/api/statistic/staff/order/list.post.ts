import type { IAuth, IDBTicket } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { size, current, sort, staff, type, range, search } = await readBody(event)
    if(!size || !current || !search) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'
    if(!staff) throw 'Không tìm thấy ID nhân viên'
    if(!type) throw 'Dữ liệu đầu vào không đủ'
    if(type == 'total' && !range) throw 'Dữ liệu đầu vào không đủ'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { staff: staff }
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

    let start : any, end : any, format : any
    const now = DayJS(Date.now())
    const yesterday = now.add(-1, 'day')
    const lastmonth = now.add(-1, 'month')
    if(type == 'today' || type == 'yesterday'){
      if(type == 'today'){
        start = now.startOf('date')
        end = now.endOf('date')
      }
      if(type == 'yesterday'){
        start = yesterday.startOf('date')
        end = yesterday.endOf('date')
      }
      format = '%Y-%m-%d'
    }
    if(type == 'month' || type == 'lastmonth'){
      if(type == 'month'){
        start = now.startOf('month')
        end = now.endOf('month')
      }
      if(type == 'lastmonth'){
        start = lastmonth.startOf('month')
        end = lastmonth.endOf('month')
      }
      format = '%Y-%m'
    }
    if(type == 'total'){
      if(!!range['start'] && !!range['end']){
        start = DayJS(range['start']).startOf('date')
        end = DayJS(range['end']).endOf('date')
      }
      format = '%Y-%m-%d'
    }
    if(!!start && !!end) match['createdAt'] = { $gte: new Date(start['$d']), $lte: new Date(end['$d']) }


    const list = await DB.TicketOrder
    .find(match)
    .populate({ path: 'ticket', select: 'code' })
    .populate({ path: 'user', select: 'name phone' })
    .populate({ path: 'cart.item', select: 'name' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.TicketOrder.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})