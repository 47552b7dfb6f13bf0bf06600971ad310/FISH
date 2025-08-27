import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { size, current, sort, search } = await readBody(event)
    if(!size || !current ) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = {}

    if(search){
      const users = await DB.User.find({
        $or: [
          { phone : { $regex : search.key.toLowerCase(), $options : 'i' }},
          { key : { $regex : search.key.toLowerCase(), $options : 'i' }},
        ]
      }).select('_id')
      
      match['user'] = { $in: users.map(i => i._id)}
    }

    const list = await DB.UserShift
    .find(match)
    .populate({ path: 'user', select: 'name' })
    .sort(sorting)
    .skip((current - 1) * size)
    .limit(size)

    const total = await DB.UserShift.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})