import md5 from 'md5'
import type { IAuth, IDBUser } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 2) throw 'Chỉ quản trị viên mới có thể thao tác'

    const body = await readBody(event)
    const { _id, password } = body
    if(!_id) throw 'Dữ liệu đầu vào không hợp lệ'

    const user = await DB.User.findOne({_id: _id}).select('_id') as IDBUser
    if(!user) throw 'Tài khoản không tồn tại'
    if(!!password) body['password'] = md5(password)

    delete body['_id']
    await DB.User.updateOne({ _id: user._id }, body)
    
    return resp(event, { message: 'Sửa thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})