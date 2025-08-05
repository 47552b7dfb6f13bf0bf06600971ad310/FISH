import md5 from 'md5'
import jwt from 'jsonwebtoken'
import type { IDBUser } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig()
    const { phone, password } = await readBody(event)
    if(!phone || !password) throw 'Vui lòng nhập đầy đủ thông tin'

    // Get User
    const user = await DB.User
    .findOne({ phone: phone.toLowerCase() })
    .select('phone password token') as IDBUser
    
    // Check User
    if(!user) throw 'Tài khoản không tồn tại'
    if(md5(password) != user.password) throw 'Mật khẩu không chính xác'

    // Create Token and Cookie
    const token = jwt.sign({
      _id : user._id
    }, runtimeConfig.apiSecret, { expiresIn: '360d' })

    setCookie(event, 'token-auth-fish-lake', token, runtimeConfig.public.cookieConfig)
    user.token = token
    await user.save()

    return resp(event, { result: true })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})