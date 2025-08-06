import jwt from 'jsonwebtoken'
import md5 from 'md5'
import type { IDBUser } from "~~/types"

const makePassword = (length : number = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const password = Array.from({ length })
  .map(() => chars[Math.floor(Math.random() * chars.length)])
  .join('')

  return password
}

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig()

    const { phone, name } = await readBody(event)
    if(!name) throw 'Vui lòng nhập họ và tên'
    if (!phone) throw 'Vui lòng nhập số điện thoại'
    if (!phone.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g)) throw 'Định dạng số điện thoại không đúng'

    // Check User
    const userCheck = await DB.User.findOne({ phone: phone }).select('phone') as IDBUser
    if(!!userCheck) throw 'Số điện thoại đã có tài khoản, vui lòng đăng nhập trước'

    // Make Pass
    const password = makePassword(10)

    // Create
    const user = await DB.User.create({
      phone: phone,
      password: md5(password),
      showpass: password,
      name: name,
      key: formatVNString(name, '-')
    })

    // Make Token And Cookie
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