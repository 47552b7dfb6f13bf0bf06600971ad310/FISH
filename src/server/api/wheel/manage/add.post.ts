import type { IAuth, IDBVoucher } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 3) throw 'Bạn không phải quản trị viên cấp cao'

    const body = await readBody(event)
    const { type, voucher, name, amount, percent } = body
    if(!name || !amount) throw 'Dữ liệu đầu vào không hợp lệ'
    if(!!isNaN(parseInt(amount)) || parseInt(amount) < 1) throw 'Số lượng không hợp lệ'
    if(!!isNaN(parseFloat(percent)) || (parseFloat(percent) * -1) > 0) throw 'Tỷ lệ không hợp lệ'
    if(type < 0 || type > 2) throw 'Kiểu phần thưởng không hỗ trợ'
    if(type == 2 && !voucher) throw 'Vui lòng chọn 1 loại Voucher'

    if(type == 2){
      const voucherCheck = await DB.Voucher.findOne({ _id: voucher }).select('title') as IDBVoucher
      if(!voucherCheck) throw 'Thẻ Voucher không tồn tại'

      body.name = voucherCheck.title
      body.voucher = voucherCheck._id
    }

    await DB.Wheel.create(body)
    return resp(event, { message: 'Thêm thành công' })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})