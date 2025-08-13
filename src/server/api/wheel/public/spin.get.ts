import type { IAuth, IDBUser, IDBWheel } from "~~/types"

const getRandomGift = (list : Array<IDBWheel>) : IDBWheel => {
  let totalPercent = 0
  let rand = 0
  totalPercent = list.reduce((accumulator, object) => {
    return parseFloat(String(accumulator)) + parseFloat(String(object.percent))
  }, 0)
  totalPercent = totalPercent
  rand = Math.random() * totalPercent

  // Get Chances
  const chances : Array<number> = []
  let acc = 0
  list.forEach(i => {
    acc = parseFloat(String(acc)) + (parseFloat(String(i.percent)))
    chances.push(acc)
  })

  // Get Index
  let index : number = 0
  chances.forEach(i => {
    if(i <= rand){
      index = index + 1
    }
  })

  return list[index]
}

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth

    const user = await DB.User.findOne({ _id: auth._id }).select('currency') as IDBUser
    if(!user) throw 'Không tìm thấy thông tin tài khoản'
    if(user.currency.wheel < 1) throw 'Bạn đã hết lượt quay'

    const list = await DB.Wheel.find({ amount: { $gt: 0 } }).select('_id percent')
    if(list.length == 0) throw 'Vòng quay hiện chưa có phần thưởng để bắt đầu'

    const resultGift = getRandomGift(list)
    if(!resultGift) throw 'Có lỗi xảy ra, vui lòng thử lại sau'
    const gift = await DB.Wheel.findOneAndUpdate({ _id: resultGift._id }, { '$inc' : { amount: -1 }}, { new: true }) as IDBWheel
    if(!gift) throw 'Có lỗi xảy ra, vui lòng thử lại sau'

    const historyCreate = {
      user: user._id,
      type: gift.type,
      name: gift.name,
      amount: gift.amount,
      percent: gift.percent
    }

    // History
    await DB.WheelHistory.create(historyCreate)
    
    // Lucky User
    if(gift.type != 0 && gift.percent <= 1){
      await DB.WheelLucky.create(historyCreate)
    }

    // Update User
    await DB.User.updateOne({ _id: user._id }, { $inc: { 'currency.wheel': -1 }})

    return resp(event, { result: gift })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})