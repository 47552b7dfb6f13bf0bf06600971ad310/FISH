import type { Mongoose } from 'mongoose'
import type { IDBFishCategory, IDBFish } from '~~/types'

export const DBFishCategory = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBFishCategory>({ 
    name: { type: String },
    key: { type: String },
    description: { type: String },
  })

  schema.index({ key: 'text' })
  const model = mongoose.model('FishCategory', schema, 'FishCategory')
  return model 
}

export const DBFish = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBFish>({ 
    area: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeArea', index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'FishCategory', index: true },
    amount: { type: Number, index: true },
    kg: { type: Number, index: true },
    time: { type: Date, index: true },
  }, {
    timestamps: true
  })

  const model = mongoose.model('Fish', schema, 'Fish')
  return model 
}