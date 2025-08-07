import type { IAuth, IDBConfig, IDBConfigShift, IDBLakeArea, IDBLakeSpot, IDBTicket, IDBUser } from "~~/types"
import md5 from "md5"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    const body = await readBody(event)
    const { area, spot, shift, lunch, pay_type } = body
    if(!area) throw 'Không tìm thấy dữ liệu khu vực'
    if(!spot) throw 'Không tìm thấy dữ liệu ô câu'
    if(!shift) throw 'Không tìm thấy dữ liệu ca câu'
    if(!pay_type) throw 'Không tìm thấy phương thức thanh toán'

    const config = await DB.Config.findOne({}).select('lunch gate') as IDBConfig
    if(!config) throw 'Hệ thống đang gặp sự cố, vui lòng thử lại sau'
    if(!config.gate.qr) throw 'Hệ thống thanh toán chưa sẵn sàng, vui lòng thử lại sau'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy dữ liệu khu vực'

    const spotCheck = await DB.LakeSpot.findOne({ _id: spot, area: areaCheck._id }).select('status') as IDBLakeSpot
    if(!spotCheck) throw 'Không tìm thấy dữ liệu ô câu'
    if(spotCheck.status > 0) throw 'Vui lòng chọn ô khác, ô này đang có người đặt'

    const shiftCheck = await DB.ConfigShift.findOne({ _id: shift }).select('price') as IDBConfigShift
    if(!shiftCheck) throw 'Không tìm thấy dữ liệu ca câu'

    const ticketHas = await DB.Ticket.count({ user: auth._id, cancel: false })
    if(ticketHas > 0) throw 'Bạn đang có 1 vé đang hoạt động, không thể đặt thêm vé mới'

    const pending = new Date(Date.now() + 10 * 60 * 1000) // 10 phút thanh toán

    let total = shiftCheck.price
    if(!!lunch) total = total + config.lunch.price

    const countTick = await DB.Ticket.count()
    const code = (config.gate.prefix || 'SEN-') + (countTick > 9 ? countTick : `0${countTick}`) +  Math.floor(Math.random() * (99 - 10) + 10)
    const token = md5(`${code}-${Date.now()}`)

    let qrcode
    qrcode = config.gate.qr
    qrcode = qrcode.replaceAll('[money]', String(total))
    qrcode = qrcode.replaceAll('[code]', code)
    qrcode = qrcode.replaceAll('[token]', token)
    qrcode = qrcode.replaceAll('[gate-name]', config.gate.name)
    qrcode = qrcode.replaceAll('[gate-number]', config.gate.number)
    qrcode = qrcode.replaceAll('[gate-person]', config.gate.person)

    await DB.Ticket.create({
      area: areaCheck._id,
      spot: spotCheck._id,
      shift: shiftCheck._id,
      user: auth._id,
      code: code,
      lunch: {
        has: !!lunch ? true : false,
        price: !!lunch ? config.lunch.price : 0
      },
      total: total,
      pay: {
        pending: pending,
        qrcode: qrcode,
        token: token,
        type: pay_type,
      }
    })

    await DB.LakeSpot.updateOne({ _id: spotCheck._id }, { status: 1 })
    return resp(event, { message: 'Đặt chỗ thành công', result: code })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})