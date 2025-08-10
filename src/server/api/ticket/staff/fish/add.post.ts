import type { IAuth, IDBFish, IDBFishCategory, IDBTicket } from "~~/types"
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

    const ticket = await DB.Ticket.findOne({ code: ticketCode }).select('code user cancel status') as IDBTicket
    if(!ticket) throw 'Vé này không còn tồn tại'
    if(!!ticket.cancel.status) throw 'Vé này đã bị hủy'
    if(ticket.status != 2) throw 'Vé này không còn khả dụng'

    const categoryFish = await DB.FishCategory.findOne({ _id: category }).select('_id') as IDBFishCategory
    if(!categoryFish) throw 'Không tìm thấy dữ liệu loại cá'

    const fish = await DB.Fish.findOne({
      category: categoryFish._id,
      amount: { "$gte": 1 }
    }).sort({ time: 1 }) as IDBFish
    if(!fish) throw 'Loại cá này không khả dụng'

    await DB.TicketFish.create({
      staff: auth._id,
      ticket: ticket._id,
      user: ticket.user,
      category: categoryFish._id,
      fish: fish._id,
      amount: 1,
      kg: kg,
      proof: {
        live: proof.live,
        image: proof.image
      }
    })
    
    const kgMinus = kg < fish.kg ? kg : fish.kg
    await DB.Fish.updateOne({ _id: fish._id }, { $inc: { 'amount': -1, 'kg': kgMinus * -1 }})
    await DB.Ticket.updateOne({ _id: ticket._id }, { $inc: { 
      'fish.amount': 1, 
      'fish.kg': kg 
    }})

    return resp(event, { message: 'Thao tác thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})