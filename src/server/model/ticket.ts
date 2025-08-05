import type { Mongoose } from 'mongoose'
import type { IDBTicket } from '~~/types'

export const DBTicket = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicket>({ 
    area: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeArea', index: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeSpot', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfigShift', index: true },

    lunch: {
      has: { type: Boolean, default: false },
      status: { type: Number, default: 0, index: true },
      price: { type: Number, index: true },
    },

    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ItemExport', index: true }],

    overtime: {
      step: { type: Number, index: true },
      price: { type: Number, index: true },
    },

    start: { type: Date, index: true },
    end: { type: Date, index: true },

    total: { type: Number, index: true },
    pay: { type: Number, default: 0, index: true },

    complete: {
      pay: { type: Boolean, default: false },
      time: { type: Boolean, default: false }
    },
  }, {
    timestamps: true
  })

  const model = mongoose.model('Ticket', schema, 'Ticket')
  return model 
}