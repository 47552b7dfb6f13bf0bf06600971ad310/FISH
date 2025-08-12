import type { Mongoose } from 'mongoose'
import type { IDBLakeArea, IDBLakeSpot } from '~~/types'

export const DBLakeArea = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBLakeArea>({ 
    name: { type: String },
    key: { type: String },
    description: { type: String },
    image: { type: String },
    future: {
      price: { type: Number, default: 0 },
      percent: { type: Number, default: 10 },
    },
    pig: {
      money: { type: Number, default: 0 },
      percent: { type: Number, default: 0 },
    }
  })

  schema.index({ key: 'text' })
  const model = mongoose.model('LakeArea', schema, 'LakeArea')
  return model 
}

export const DBLakeSpot = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBLakeSpot>({ 
    area: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeArea', index: true },
    code: { type: String },
    status: { type: Number, index: true, default: 0 },
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('LakeSpot', schema, 'LakeSpot')
  return model 
}