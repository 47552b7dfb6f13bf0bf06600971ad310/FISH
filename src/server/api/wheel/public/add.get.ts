import type { IAuth, IDBConfig, IDBUser } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const config = await DB.Config.findOne().select('wheel') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.wheel.start) throw 'Vòng quay hiện tại chưa mở'

    const user = await DB.User.findOne({ _id: auth._id }).select('currency statistic') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'

    const num = Math.floor(user.statistic.payweek / config.wheel.price)
    if(num <= 0) throw 'Bạn không có điểm tích lũy đủ để quy đổi vòng quay'

    await DB.User.updateOne({ _id: user._id }, {
      $inc: { 'currency.wheel': num },
      $set: { 'statistic.payweek': user.statistic.payweek - (num * config.wheel.price) }
    })

    return resp(event, { message: `Bạn đã được thêm ${num} lượt quay` })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})