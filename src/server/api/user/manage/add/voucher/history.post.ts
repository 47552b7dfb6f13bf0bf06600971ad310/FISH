import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { size, current, sort } = await readBody(event)
    if(!size || !current) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { }
    const list = await DB.LogAddVoucher
    .find(match)
    .populate({ path: 'staff', select: 'phone' })
    .populate({ path: 'user', select: 'phone' })
    .populate({ path: 'voucher', select: 'title' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.LogAddVoucher.count(match)
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})