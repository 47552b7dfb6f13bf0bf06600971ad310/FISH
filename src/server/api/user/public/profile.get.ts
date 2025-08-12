import type { IAuth, IDBUser } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const user = await DB.User.findOne({ _id: auth._id }).select('-password -token -vouchers') as IDBUser
    return resp(event, { result: user })
  } 
  catch (e:any) {
    return resp(event, { code: 401, message: e.toString() })
  }
})