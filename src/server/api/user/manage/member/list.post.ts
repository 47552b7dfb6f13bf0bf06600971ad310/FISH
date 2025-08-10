import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { size, current, sort, search } = await readBody(event)
    if(!size || !current || !search) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = {}

    if(search.key){
      if(search.by == 'CODE') match['code'] = { $regex : search.key.toLowerCase(), $options : 'i' }
      if(search.by == 'USER'){
        const users = await DB.User.find({
          $or: [
            { phone : { $regex : search.key.toLowerCase(), $options : 'i' }},
            { key : { $regex : search.key.toLowerCase(), $options : 'i' }},
          ]
        }).select('_id')
        
        match['user'] = { $in: users.map(i => i._id)}
      }
    }

    const list = await DB.UserMember
    .find(match)
    .populate({ path: 'user', select: 'phone' })
    .populate({ path: 'verify.person', select: 'phone' })
    .sort(sorting)
    .skip((current - 1) * size)
    .limit(size)

    const total = await DB.UserMember.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})