import type { Mongoose } from 'mongoose'
import type { IDBItemCategory, IDBItem, IDBItemImport, IDBItemExport } from '~~/types'

export const DBItemCategory = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBItemCategory>({ 
    name: { type: String },
    key: { type: String }
  })

  schema.index({ key: 'text' })

  const model = mongoose.model('ItemCategory', schema, 'ItemCategory')
  return model 
}

export const DBItem = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBItem>({ 
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory', index: true },
    name: { type: String },
    key: { type: String },
    description: { type: String },
    image: { type: String },
    price: { type: Number, index: true },
    inventory: { type: Number, default: 0, index: true },
    display: { type: Boolean, default: true, index: true },
  }, {
    timestamps: true
  })

  schema.index({ key: 'text' })

  const model = mongoose.model('Item', schema, 'Item')
  return model 
}

export const DBItemImport = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBItemImport>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory', index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', index: true },
    amount: { type: Number, index: true },
    price: { type: Number, index: true },
    note: { type: String },
  }, {
    timestamps: true
  })

  const model = mongoose.model('ItemImport', schema, 'ItemImport')
  return model 
}

export const DBItemExport = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBItemExport>({ 
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory', index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', index: true },
    amount: { type: Number, index: true },
    price: { type: Number, index: true },
    note: { type: String },
  }, {
    timestamps: true
  })

  const model = mongoose.model('ItemExport', schema, 'ItemExport')
  return model 
}