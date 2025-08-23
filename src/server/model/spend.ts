import type { Mongoose } from 'mongoose'
import type { IDBSpend } from '~~/types'

export const DBSpend= (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBSpend>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String },
    money: { type: Number, index: true },
    reason: { type: String },
    images: [{ type: String }],
    time: { type: Date, index: true },
  }, {
    timestamps: true
  })

  schema.index({ title: 'text' })

  const model = mongoose.model('Spend', schema, 'Spend')
  return model 
}
