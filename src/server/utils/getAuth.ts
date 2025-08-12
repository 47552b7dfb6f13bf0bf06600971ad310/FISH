import { use, type H3Event } from 'h3'
import type { IDBUser, IResp, IAuth } from '~~/types'
import jwt from 'jsonwebtoken'

export default async (event: H3Event, throwError : boolean = true) : Promise<IAuth | IResp | null> => {
  const runtimeConfig = useRuntimeConfig()

  try {
    const token = getCookie(event, 'token-auth-fish-lake')
    if(!token) throw 'Vui lòng đăng nhập trước'

    const decoded = jwt.verify(token, runtimeConfig.apiSecret) as any
    const user = await DB.User.findOne({ _id: decoded._id }) as IDBUser

    if(!user) throw 'Xác thực tài khoản không thành công'
    if(user.token != token) throw 'Tài khoản đang đăng nhập ở nơi khác, vui lòng đăng nhập lại'

    const result : IAuth = { 
      _id: user._id,
      phone: user.phone,
      name: user.name,
      type: user.type,
      currency: user.currency,
      member: user.member,
      statistic: user.statistic
    }
    event.context.auth = result
    return Promise.resolve(result)
  }
  catch (e:any) {
    if(!!throwError) {
      deleteCookie(event, 'token-auth-fish-lake', runtimeConfig.public.cookieConfig)
      event.node.res.end(JSON.stringify({code: 401, message: e.toString()}))
    }
    return Promise.resolve(null)
  }
}