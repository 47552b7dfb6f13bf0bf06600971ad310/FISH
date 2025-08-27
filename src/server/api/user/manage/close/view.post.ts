import type { IAuth, IDBUserShift } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    const { _id } = await readBody(event)
    if(!_id) throw 'Không tìm ID giao ca'

    const current = await DB.UserShift.findOne({ _id: _id })
    .select('stock time user') 
    .populate({ path: 'stock.item', select: 'name' }) as IDBUserShift
    if(!current) throw 'Dữ liệu giao ca không tồn tại'
    const currentStock = current.stock

    const prev = await DB.UserShift.findOne({ "time.end": { $lt: current.time.end }})
    .select('stock time') 
    .populate({ path: 'stock.item', select: 'name' })
    .sort({ "time.end": -1 }) as IDBUserShift
    let prevStock : Array<any> = []
    if(!!prev) prevStock = prev.stock

    const soldAgg = await DB.ItemExport.aggregate([
      { $match: {
        createdAt: { $gte: current.time.start, $lte: current.time.end },
        staff: current.user
      }},
      { $group: { _id: "$item", totalSold: { $sum: "$amount" } } }
    ])

    const soldMap = new Map(soldAgg.map(s => [s._id.toString(), s.totalSold]))
    const prevMap = new Map(prevStock.map((s : any) => [s.item._id.toString(), { name: s.item.name, quantity: s.quantity }]))
    const currMap = new Map(currentStock.map((s : any) => [s.item._id.toString(), { name: s.item.name, quantity: s.quantity }]))
    const allIds = new Set([...prevMap.keys(), ...currMap.keys(), ...soldMap.keys()])

    const result =  Array.from(allIds).map(id => {
      const prev = prevMap.get(id)
      const curr = currMap.get(id)
      const sold = soldMap.get(id)

      return {
        item: {
          _id: id,
          name: curr?.name || prev?.name || 'N/A'
        },
        previous: prev?.quantity || 0,
        current: curr?.quantity || 0,
        sold: sold || 0,
        diff: (curr?.quantity || 0) - (prev?.quantity || 0)
      }
    })

    return resp(event, { result })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})