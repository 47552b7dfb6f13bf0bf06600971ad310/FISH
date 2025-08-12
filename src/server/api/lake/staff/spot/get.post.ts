import { IAuth, IDBLakeArea, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const { _id } = await readBody(event)
    if(!_id) throw 'Không tìm thấy mã ô câu'

    const spot = await DB.LakeSpot.findOne({ _id: _id }) as IDBLakeSpot
    if(!spot) throw 'Không tìm thấy dữ liệu ô câu'
    if(spot.status == 0) throw 'Ô này đang trống, không thể xem'

    const area = await DB.LakeArea.findOne({ _id: spot.area }) as IDBLakeArea
    if(!area) throw 'Không tìm thấy dữ liệu khu vực'

    const ticket = await DB.Ticket
    .findOne({ 'area': area._id, 'spot': spot._id, 'cancel.status': false })
    .populate({ path: 'user', select: 'name phone' })
    .populate({ path: 'area', select: 'name' })
    .populate({ path: 'spot', select: 'code status' })
    .populate({ path: 'shift', select: 'name duration price' })
    .populate({ path: 'discount.voucher', select: 'value' }) as IDBTicket
    if(!ticket) throw 'Ô này chưa được sử dụng'

    return resp(event, { result: { ticket, spot, area } })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})