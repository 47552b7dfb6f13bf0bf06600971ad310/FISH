import type { Mongoose } from 'mongoose'
import type { IDBTicket } from '~~/types'

export const DBTicket = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicket>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    area: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeArea', index: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeSpot', index: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfigShift', index: true },

    code: { type: String },

    lunch: {
      has: { type: Boolean, default: false },
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

    pay: {
      total: { type: Number, default: 0, index: true },
      pending: { type: Date, index: true },
      qrcode: { type: String },
      token: { type: String },
      type: { type: String },
    },

    complete: {
      pay: {
        total: { type: Boolean, default: false },
        pending: { type: Boolean, default: false },
      },
      time: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
    },

    cancel: { type: Boolean, default: false }
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('Ticket', schema, 'Ticket')
  return model 
}