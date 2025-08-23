import type { Mongoose } from 'mongoose'
import type { IDBTicket, IDBTicketOrder, IDBTicketConnect, IDBTicketFish } from '~~/types'

export const DBTicket = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicket>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    area: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeArea', index: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeSpot', index: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfigShift', index: true },

    code: { type: String },

    lunch: {
      has: { type: Boolean, default: false },
      complete: { type: Boolean, default: false },
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    },

    time: {
      start: { type: Date, index: true },
      end: { type: Date, index: true },
      pay: { type: Date, index: true },
      delay: { type: Date, index: true },
    },

    price: {
      spot: { type: Number, default: 0, index: true },
      lunch: { type: Number, default: 0, index: true },
      item: { type: Number, default: 0, index: true },
      pig: { type: Number, default: 0, index: true },
      connect: { type: Number, default: 0, index: true },
      total: { type: Number, default: 0, index: true },
    },

    pay: {
      qrcode: { type: String },
      token: { type: String },
      type: { type: String },
      complete: { type: Boolean, default: false },
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    },

    discount: {
      time: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      price: { type: Number, default: 0 },
      miss: { type: Number, default: 0 },
      voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', index: true },
    },

    fish: {
      amount: { type: Number, default: 0, index: true },
      kg: { type: Number, default: 0, index: true },
    },

    cancel: {
      status: { type: Boolean, default: false },
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    },

    guest: {
      status: { type: Boolean, default: false },
      staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    },

    status: { type: Number, default: 0 }, // 0: Pay Waiting, 1: Pay Success, 2: Start, 3: Before End, 4: End

    withOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'TicketOrder', index: true },
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
    money: { type: Number, index: true },

    status: { type: Number, default: 0 },

    pay: {
      type: { type: String },
      qrcode: { type: String },
      token: { type: String },
      time: { type: Date },
      reason: { type: String },
    },
    

    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('TicketOrder', schema, 'TicketOrder')
  return model 
}

export const DBTicketConnect = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicketConnect>({ 
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    code: { type: String },

    old: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfigShift', index: true },
    new: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfigShift', index: true },
    
    total: { type: Number, index: true },
    money: { type: Number, index: true },

    status: { type: Number, default: 0 },

    pay: {
      type: { type: String },
      qrcode: { type: String },
      token: { type: String },
      time: { type: Date },
      reason: { type: String },
    },
    
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('TicketConnect', schema, 'TicketConnect')
  return model 
}

export const DBTicketFish = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBTicketFish>({ 
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    area: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'FishCategory', index: true },
    fish: { type: mongoose.Schema.Types.ObjectId, ref: 'Fish', index: true },

    amount: { type: Number, index: true },
    kg: { type: Number, index: true },

    proof: {
      live: { type: String },
      image: { type: String }
    },

    isPig: { type: Boolean, default: false }
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })

  const model = mongoose.model('TicketFish', schema, 'TicketFish')
  return model 
}