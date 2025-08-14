import type { Mongoose } from 'mongoose'
import type { IDBLogUser, IDBLogAddVoucher } from '~~/types'

export const DBLogUser = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBLogUser>({ 
    type: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String }
  }, {
    timestamps: true
  })

  const model = mongoose.model('LogUser', schema, 'LogUser')
  return model
}


export const DBLogAddVoucher = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBLogAddVoucher>({ 
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', index: true },
  }, {
    timestamps: true
  })

  const model = mongoose.model('LogAddVoucher', schema, 'LogAddVoucher')
  return model
}

