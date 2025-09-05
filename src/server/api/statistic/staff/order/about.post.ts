import { Types } from "mongoose"
import type { IAuth, IDBTicket } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { staff, type, range } = await readBody(event)
    if(!staff) throw 'Không tìm thấy ID nhân viên'
    if(!type) throw 'Dữ liệu đầu vào không đủ'
    if(type == 'total' && !range) throw 'Dữ liệu đầu vào không đủ'

    const match : any = { 
      staff: new Types.ObjectId(staff),
      status: 1
    }

    let start : any, end : any, format : any
    const now = DayJS(Date.now())
    const yesterday = now.add(-1, 'day')
    const lastmonth = now.add(-1, 'month')
    if(type == 'today' || type == 'yesterday'){
      if(type == 'today'){
        start = now.startOf('date')
        end = now.endOf('date')
      }
      if(type == 'yesterday'){
        start = yesterday.startOf('date')
        end = yesterday.endOf('date')
      }
      format = '%Y-%m-%d'
    }
    if(type == 'month' || type == 'lastmonth'){
      if(type == 'month'){
        start = now.startOf('month')
        end = now.endOf('month')
      }
      if(type == 'lastmonth'){
        start = lastmonth.startOf('month')
        end = lastmonth.endOf('month')
      }
      format = '%Y-%m'
    }
    if(type == 'total'){
      if(!!range['start'] && !!range['end']){
        start = DayJS(range['start']).startOf('date')
        end = DayJS(range['end']).endOf('date')
      }
      format = '%Y-%m-%d'
    }
    if(!!start && !!end) match['createdAt'] = { $gte: new Date(start['$d']), $lte: new Date(end['$d']) }


    const data = await DB.TicketOrder.aggregate([
      { $match: match },
      { $project: { cart: 1 }},
      { $unwind: "$cart" },
      { 
        $group: {
          _id: "$cart.item", 
          totalAmount: { $sum: "$cart.amount" },
          totalMoney: { $sum: { $multiply: ["$cart.amount", "$cart.price"] } }
        }
      },
      {
        $lookup: {
          from: "Item",
          localField: "_id",
          foreignField: "_id",
          pipeline: [
            { $project: { name: 1 }}
          ],
          as: "item"
        }
      },
      { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
      { $project: {
        name: '$item.name',
        totalAmount: 1,
        totalMoney: 1
      }}
    ])

    return resp(event, { result: data })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})