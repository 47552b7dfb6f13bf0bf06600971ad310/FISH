import type { Mongoose } from 'mongoose'
import type { IDBWheel, IDBWheelHistory, IDBWheelLucky } from '~~/types'

export const DBWheel = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBWheel>({ 
    type: { type: Number, index: true },
    name: { type: String },
    amount: { type: Number, index: true },
    percent: { type: Number, index: true },
  }, {
    timestamps: true
  })

  const model = mongoose.model('Wheel', schema, 'Wheel')
  return model 
}

export const DBWheelHistory = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBWheelHistory>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    type: { type: Number, index: true },
    name: { type: String },
    amount: { type: Number, index: true },
    percent: { type: Number, index: true },

    received: { type: Boolean, default: false },
    giver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  }, {
    timestamps: true
  })

  const model = mongoose.model('WheelHistory', schema, 'WheelHistory')
  return model 
}

export const DBWheelLucky = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBWheelLucky>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    type: { type: Number, index: true },
    name: { type: String },
    amount: { type: Number, index: true },
    percent: { type: Number, index: true },
  }, {
    timestamps: true
  })

  const model = mongoose.model('WheelLucky', schema, 'WheelLucky')
  return model 
}