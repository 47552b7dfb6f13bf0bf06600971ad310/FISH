import { IAuth, IDBUser, IDBVoucher } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const { type } = await readBody(event)

    const user = await DB.User.findOne({ _id: auth._id }).select('vouchers') as IDBUser
    if(!user) throw true

    const match : any = { _id: { $in: user.vouchers }}
    if(type) match['type'] = { $in: type }

    const list = await DB.Voucher.find(match).select('title value type')
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})