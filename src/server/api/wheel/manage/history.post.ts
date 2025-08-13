import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { size, current, sort, search} = await readBody(event)
    if(!size || !current || !search) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { }
    if(!!search.key){
      const users = await DB.User.find({
        username : { $regex : search.key.toLowerCase(), $options : 'i' }
      }).select('_id')

      match['user'] = { $in: users.map(i => i._id)}
    }

    const list = await DB.WheelHistory
    .find(match)
    .populate({ path: 'user', select: 'phone' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.WheelHistory.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})