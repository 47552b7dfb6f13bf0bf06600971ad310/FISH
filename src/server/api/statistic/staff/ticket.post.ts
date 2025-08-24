import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { size, current, sort, search, area, staff } = await readBody(event)
    if(!size || !current || !search || !sort) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'
    if(!staff) throw 'Không tìm thấy ID nhân viên'

    const sorting : any = {}
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { 'pay.staff': staff, 'pay.complete': true }
    if(!!area) match['area'] = area
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
      if(search.by == 'CODE'){
        match['code'] = { $regex : search.key.toLowerCase(), $options : 'i' }
      }
    }

    const list = await DB.Ticket
    .find(match)
    .populate({ path: 'user', select: 'phone name' })
    .populate({ path: 'area', select: 'name' })
    .populate({ path: 'spot', select: 'code' })
    .populate({ path: 'shift', select: 'duration name' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.Ticket.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})