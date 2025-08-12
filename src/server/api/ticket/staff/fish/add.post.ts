import type { IAuth, IDBFish, IDBFishCategory, IDBLakeArea, IDBTicket } from "~~/types"
export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { ticket : ticketCode, category, proof, kg } = await readBody(event)
    if(!ticketCode) throw 'Không tìm thấy mã vé'
    if(!category) throw 'Không tìm thấy loại cá'
    if(!proof) throw 'Không tìm thấy bằng chứng'
    if(!proof.live) throw 'Vui lòng thêm Link Livestream'
    if(!kg) throw 'Vui lòng thêm cân nặng ước tính'
    if(!isNumber(kg) || kg < 1) throw 'Cân nặng không hợp lệ'

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('area code user cancel status') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.status != 2) throw 'Vé này không còn khả dụng'

    const categoryFish = await DB.FishCategory.findOne({ _id: category }).select('_id') as IDBFishCategory
    if(!categoryFish) throw 'Không tìm thấy dữ liệu loại cá'

    const fish = await DB.Fish.findOne({
      area: ticket.area,
      category: categoryFish._id,
      amount: { "$gte": 1 }
    }).sort({ time: 1 }) as IDBFish
    if(!fish) throw 'Loại cá này không khả dụng'
    if(fish.amount == 1 && kg != fish.kg) throw 'Cân nặng không hợp lệ, vui lòng nhập ' + fish.kg + ' kg'

    await DB.TicketFish.create({
      staff: auth._id,
      ticket: ticket._id,
      user: ticket.user,
      area: ticket.area,
      category: categoryFish._id,
      fish: fish._id,
      amount: 1,
      kg: kg,
      proof: {
        live: proof.live,
        image: proof.image
      },
      isPig: fish.isPig || false
    })
    
    const kgMinus = kg < fish.kg ? kg : fish.kg
    await DB.Fish.updateOne({ _id: fish._id }, { $inc: { 'amount': -1, 'kg': kgMinus * -1 }})
    await DB.Ticket.updateOne({ _id: ticket._id }, { $inc: { 
      'fish.amount': 1, 
      'fish.kg': kg 
    }})

    if(!!fish.isPig){
      const area = await DB.LakeArea.findOne({ _id: ticket.area }).select('pig') as IDBLakeArea
      if(!!area && area.pig.money > 0){
        await DB.User.updateOne({ _id: ticket.user }, { $inc: { 'currency.pig': area.pig.money }})
        await DB.LakeArea.updateOne({ _id: ticket.area }, { $inc: { 'pig.money': area.pig.money * -1 }})
      }
    }

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})