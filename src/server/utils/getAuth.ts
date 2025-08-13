import { type H3Event } from 'h3'
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

    // Get Time
    const nowTime = Date.now()
    user.login.update = nowTime
    
    // User Member Week
    if(!!user.member.week.enable && !user.member.month.enable){
      const end = DayJS(user.member.week.end).unix()
      const now = DayJS(nowTime).unix()
      if(end < now){
        user.member.week.enable = false
        user.member.week.end = null
        user.member.week.free.lunch = 0
        user.member.week.free.time = 0
        user.member.week.discount = 0
      }
    }

    // User Member Month
    if(!!user.member.month.enable && !user.member.week.enable){
      const end = DayJS(user.member.month.end).unix()
      const now = DayJS(nowTime).unix()
      if(end < now){
        user.member.month.enable = false
        user.member.month.end = null
        user.member.month.free.lunch = 0
        user.member.month.free.time = 0
        user.member.month.discount = 0
      }
    }

    // Save User
    await user.save()

    // Result
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