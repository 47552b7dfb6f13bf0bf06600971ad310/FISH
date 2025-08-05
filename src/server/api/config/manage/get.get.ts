import type { IAuth, IDBConfig } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'
    
    const config = await DB.Config.findOne() as IDBConfig
    if(!config) throw 'Không tìm thấy cấu hình trang'
    
    return resp(event, { result: config })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})