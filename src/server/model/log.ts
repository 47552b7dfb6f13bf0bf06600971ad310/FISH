import type { Mongoose } from 'mongoose'
import type { IDBLogUser } from '~~/types'

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

