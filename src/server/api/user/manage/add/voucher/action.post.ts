import type { IAuth, IDBUser, IDBVoucher } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Chỉ ADMIN mới có thể thao tác'

    const body = await readBody(event)
    const { phone, voucher : voucherID } = body
    if(!phone) throw 'Vui lòng cung cấp số điện thoại'
    if(!voucherID) throw 'Vui lòng chọn thẻ Voucher'

    const user = await DB.User.findOne({ phone: phone }).select('_id') as IDBUser
    if(!user) throw 'Tài khoản không tồn tại'

    const voucher = await DB.Voucher.findOne({ _id: voucherID }).select('_id') as IDBVoucher
    if(!voucher) throw 'Thẻ Voucher không tồn tại'

    await DB.User.updateOne({ _id: user._id }, { $push: { vouchers: voucher } })
    await DB.LogAddVoucher.create({
      staff: auth._id,
      user: user._id,
      voucher: voucher._id
    })
    
    return resp(event, { message: 'Tặng thẻ thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})