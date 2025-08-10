import type { IAuth } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { size, current, sort } = await readBody(event)
    if(!size || !current) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { 
      'cancel.status': false,
      'lunch.has': true,
      'lunch.complete': false
    }

    const list = await DB.Ticket
    .find(match)
    .select('code area spot status')
    .populate({ path: 'area', select: 'name' })
    .populate({ path: 'spot', select: 'code' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.Ticket.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})