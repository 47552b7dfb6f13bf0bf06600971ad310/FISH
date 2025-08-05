import type { IAuth } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const { size, current, sort, search, item } = await readBody(event)
    if(!size || !current || !search) throw 'Dữ liệu phân trang sai'
    if(!sort.column || !sort.direction) throw 'Dữ liệu sắp xếp sai'

    const sorting : any = { }
    sorting[sort.column] = sort.direction == 'desc' ? -1 : 1

    const match : any = { item: item }
    if(!!search.key){
      const users = await DB.User.find({
        $or: [
          { phone : { $regex : search.key.toLowerCase(), $options : 'i' } },
          { email : { $regex : search.key.toLowerCase(), $options : 'i' } },
          {  key : { $regex : search.key.toLowerCase(), $options : 'i' } },
        ]
      }).select('_id')
      
      match['user'] = { $in: users.map(i => i._id) }
    }

    const list = await DB.ItemImport
    .find(match)
    .populate({ path: 'user', select: 'name' })
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'item', select: 'name' })
    .sort(sorting)
    .limit(size)
    .skip((current - 1) * size)

    const total = await DB.ItemImport.count(match)
    
    return resp(event, { result: { list, total } })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})