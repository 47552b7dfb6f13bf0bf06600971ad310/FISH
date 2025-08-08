import type { Mongoose } from 'mongoose'
import type { IDBTicket, IDBTicketOrder, IDBTicketFish } from '~~/types'

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
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
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
      order: { type: Number, default: 0, index: true },
      pending: { type: Date, index: true },
      qrcode: { type: String },
      token: { type: String },
      type: { type: String }
    },

    complete: {
      pay: {
        total: { type: Boolean, default: false },
        pending: { type: Boolean, default: false },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
      },
      time: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      cancel: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    },

    fish: {
      amount: { type: Number, default: 0, index: true },
      kg: { type: Number, default: 0, index: true },
    },

    cancel: { type: Boolean, default: false },

    status: { type: Number, default: 0 },
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('Ticket', schema, 'Ticket')
  return model 
}

export const DBTicketOrder = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicketOrder>({ 
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    code: { type: String },

    cart: [{
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', index: true },
      amount: { type: Number },
      price: { type: Number },
    }],
    
    total: { type: Number, index: true },

    status: { type: Number, default: 0 },

    pay: {
      type: { type: String },
      qrcode: { type: String },
      token: { type: String },
    },

    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('TicketOrder', schema, 'TicketOrder')
  return model 
}

export const DBTicketFish = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicketFish>({ 
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'FishCategory', index: true },
    fish: { type: mongoose.Schema.Types.ObjectId, ref: 'Fish', index: true },

    amount: { type: Number, index: true },
    kg: { type: Number, index: true },

    proof: {
      live: { type: String },
      image: { type: String }
    }
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('TicketFish', schema, 'TicketFish')
  return model 
}