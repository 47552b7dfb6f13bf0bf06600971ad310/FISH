import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { size, current, sort, search } = await readBody(event)
    if(!size || !current) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { }
    if(!!search){
      const users = await DB.User.find({
        username : { $regex : search.toLowerCase(), $options : 'i' }
      }).select('_id')
      match['user'] = { $in: users.map(i => i._id)}
    }

    const list = await DB.VoucherHistory
    .find(match)
    .populate({ path: 'voucher', select: 'title value type' })
    .populate({ path: 'user', select: 'phone' })
    .populate({ path: 'ticket', select: 'code' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.VoucherHistory.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})