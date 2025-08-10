import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 2) throw 'Chỉ quản trị viên mới có thể thao tác'

    const body = await readBody(event)
    await verifyUserMember(body, auth._id)

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})