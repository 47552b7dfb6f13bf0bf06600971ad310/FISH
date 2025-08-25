import md5 from 'md5'
import type { IDBConfig, IDBUser } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { phone, name } = await readBody(event)
    if(!name) throw 'Vui lòng nhập họ và tên'
    if (!phone) throw 'Vui lòng nhập số điện thoại'

    // Get Config
    const config = await DB.Config.findOne().select('reg') as IDBConfig
    if(!config) throw 'Hệ thống chưa sẵn sàng để đăng ký'

    // Check User
    const userCheck = await DB.User.findOne({ phone: phone }).select('phone') as IDBUser
    if(!!userCheck) throw 'Số điện thoại đã tồn tại'

    // Create
    const user = await DB.User.create({
      phone: phone,
      password: md5(phone),
      name: name,
      key: formatVNString(name, '-'),
      guestauto: true
    }) as IDBUser

    return resp(event, { result: true })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})