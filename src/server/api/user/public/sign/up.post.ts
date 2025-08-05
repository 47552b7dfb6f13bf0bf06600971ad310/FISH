import jwt from 'jsonwebtoken'
import md5 from 'md5'
import type { IDBUser } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig()

    const { password, phone, name } = await readBody(event)
    if(!name) throw 'Vui lòng nhập họ và tên'

    if (!phone) throw 'Vui lòng nhập số điện thoại'
    if (!phone.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g)) throw 'Định dạng số điện thoại không đúng'

    if (!password) throw 'Vui lòng nhập mật khẩu'
    if (password.length < 6 || password.length > 15) throw 'Mật khẩu trong khoảng 6-15 ký tự'
    if (!!password.match(/\s/g)) throw 'Mật khẩu không có khoảng cách'

    // Check User
    const userCheck = await DB.User.findOne({ phone: phone }).select('phone') as IDBUser
    if(!!userCheck) throw 'Số điện thoại đã tồn tại'

    // Create
    const user = await DB.User.create({
      phone: phone,
      password: md5(password),
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

    return resp(event, { message: 'Đăng ký thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})