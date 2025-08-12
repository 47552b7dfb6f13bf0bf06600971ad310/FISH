import type { IAuth, IDBUser } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { size, current, sort } = await readBody(event)
    if(!size || !current) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { user: auth._id }

    const list = await DB.Ticket
    .find(match)
    .populate({ path: 'area', select: 'name' })
    .populate({ path: 'spot', select: 'code status' })
    .populate({ path: 'shift', select: 'name duration price' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.Ticket.count(match)

    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 401, message: e.toString() })
  }
})