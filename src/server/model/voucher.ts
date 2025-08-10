import type { Mongoose } from 'mongoose'
import type { IDBVoucher, IDBVoucherHistory } from '~~/types'

export const DBVoucher = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBVoucher>({ 
    type: { type: String, index: true },
    title: { type: String },
    expired: { type: Date },
    limit: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    display: { type: Boolean, default: true }
  }, {
    timestamps: true
  })

  schema.index({ title: 'text', type: 'text' })

  const model = mongoose.model('Voucher', schema, 'Voucher')
  const autoCreate = async () => {
    const count = await model.count()
    if(count > 0) return

    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 5%', value: 5 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 10%', value: 10 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 15%', value: 15 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 20%', value: 20 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 25%', value: 25 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 30%', value: 30 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 35%', value: 35 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 40%', value: 40 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 45%', value: 45 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 50%', value: 50 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 55%', value: 55 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 60%', value: 60 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 65%', value: 65 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 70%', value: 70 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 75%', value: 75 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 80%', value: 80 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 85%', value: 85 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 90%', value: 90 })
    await model.create({ type: 'DISCOUNT', title: 'Phiếu giảm giá 100%', value: 100 })
  }

  autoCreate()
  return model
}

export const DBVoucherHistory = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBVoucherHistory>({ 
    voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    content: { type: String },
  }, {
    timestamps: true
  })

  const model = mongoose.model('VoucherHistory', schema, 'VoucherHistory')
  return model
}