import type { } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { size, tab } = await readBody(event)
    if(!size || !tab) throw 'Dữ liệu phân trang sai'

    const match : any = {}
    const sort : any = {}
    match[`charity.${tab}`] = { $gt: 0 }
    sort[`charity.${tab}`] = -1

    const list = await DB.User
    .find(match)
    .select('name charity')
    .sort(sort)
    .limit(size)

    return resp(event, { result: list })
  }
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})