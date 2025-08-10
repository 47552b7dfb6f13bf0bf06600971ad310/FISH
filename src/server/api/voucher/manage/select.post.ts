import { IAuth, IDBVoucher } from "~~/types"

const mergeArray = (input : Array<IDBVoucher>, list : Array<IDBVoucher>) => {
  const arr = input.concat(list)

  const merge = arr.reduce((a : Array<IDBVoucher>, c : IDBVoucher) => {
    const obj = a.find((obj : IDBVoucher) => obj._id.toString() === c._id.toString())
    if(!obj) a.push(c)
    return a
  }, [])

  return merge
}

export default defineEventHandler(async (event) => {
  try {
    const { key, _id } = await readBody(event)
    const match : any = { display: true }

    if(!!key){
      match['$or'] = [
        { title : { $regex : key.toLowerCase(), $options: 'i' }},
        { type : { $regex : key.toLowerCase(), $options: 'i' }}
      ]
    }

    let list = await DB.Voucher.find(match).select('title value').limit(10) as Array<IDBVoucher>
    
    if(!!_id){
      const voucher = await DB.Voucher.findOne({ _id: _id }).select('title value') as IDBVoucher
      const vouchers = [ voucher ]
      list = mergeArray(list, vouchers)
    }

    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})