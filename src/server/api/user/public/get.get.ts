import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    return resp(event, { result: auth })
  } 
  catch (e:any) {
    return resp(event, { code: 401, message: e.toString() })
  }
})