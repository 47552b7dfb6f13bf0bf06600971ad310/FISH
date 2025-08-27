import type { IAuth } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền thao tác'

    const { time, stock, cashInDrawer, cashReported, note } = await readBody(event)
    if(!time) throw 'Thời gian không hợp lệ'
    if(!time.start) throw 'Vui lòng nhập đủ thời gian'
    if(!Array.isArray(stock)) throw 'Dịch vụ nhập không hợp lệ'
    if(!isNumber(cashInDrawer) || cashInDrawer < 0) throw 'Tiền cầm lúc nhận ca không hợp lệ'
    if(!isNumber(cashReported) || cashReported < 0) throw 'Tiền bàn giao ca không hợp lệ'

    // Check Time
    const timeNow = Date.now()
    const now = DayJS(timeNow)
    const start = DayJS(time.start)
    if(start.unix() > now.unix()) throw 'Thời gian bắt đầu ca không hợp lệ'

    // Check Has
    const countHas = await DB.UserShift.count([
      { $match: { 
        user: auth._id,
        createdAt: { $gte: new Date(start['$d']), $lte: new Date(now['$d']) }
      }}
    ])
    if(countHas > 0) throw 'Bạn đã có 1 đơn giao ca trong thời gian này'

    // Check Stock
    const stockSave = stock.filter((product : any) => !!product.item && !!product.quantity)

    // Create
    await DB.UserShift.create({
      user: auth._id,
      time: {
        start: time.start,
        end: timeNow
      },
      stock: stockSave,
      cashInDrawer: cashInDrawer,
      cashReported: cashReported,
      note: note
    })

    return resp(event, { message: 'Giao ca thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})