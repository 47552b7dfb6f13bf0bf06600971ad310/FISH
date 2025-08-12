import type { Mongoose } from 'mongoose'
import type { IDBConfig, IDBConfigShift } from '~~/types'

export const DBConfig = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBConfig>({ 
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    address: { type: String, default: '' },
    image: {
      logo: { type: String, default: '' },
      banner: { type: String, default: '' },
    },
    contact: {
      owner: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    gate: {
      prefix: { type: String, default: '' },
      name: { type: String, default: '' },
      number: { type: String, default: '' },
      person: { type: String, default: '' },
      secret: { type: String, default: '' },
      qr: { type: String, default: '' },
    },
    social: {
      facebook: { type: String, default: '' },
      messenger: { type: String, default: '' },
      zalo: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    overtime: {
      step: { type: Number, default: 1 },
      price: { type: Number, default: 50000 },
    },
    lunch: {
      price: { type: Number, default: 50000 },
    },
    time: {
      create: { type: Date },
      start: { type: Date },
      delay: { type: Number, default: 10 },
      pay: { type: Number, default: 10 },
    },
    member: {
      week: {
        price: { type: Number, default: 500000 },
        discount: { type: Number, default: 10 },
        wheel: { type: Number, default: 0 },
        free: {
          lunch: { type: Number, default: 7 },
          time: { type: Number, default: 40 },
        }
      },
      month: {
        price: { type: Number, default: 1500000 },
        discount: { type: Number, default: 15 },
        wheel: { type: Number, default: 1 },
        free: {
          lunch: { type: Number, default: 30 },
          time: { type: Number, default: 180 },
        }
      }
    },
    reg: {
      voucher: {
        source: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', index: true },
        amount: { type: Number, default: 0 },
      }
    },
    miss: {
      1: { type: Number, default: 5 },
      2: { type: Number, default: 10 },
      3: { type: Number, default: 20 },
    }
  })

  const model = mongoose.model('Config', schema, 'Config')

  const autoCreate = async () => {
    const count = await model.count({})
    if(count == 0) await model.create({ 
      name: 'Sen Hồ 2', 
      description: 'Hồ Câu Dịch Vụ',
      contact: {
        owner: 'Nguyễn Đức Thuận',
        phone: '0962984900'
      },
    })
  }

  autoCreate()
  return model 
}

export const DBConfigShift = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBConfigShift>({ 
    area: { type: mongoose.Schema.Types.ObjectId, ref: 'LakeArea', index: true },
    name: { type: String },
    key: { type: String },
    duration: { type: Number, index: true },
    price: { type: Number, index: true },
    display: { type: Boolean, index: true, default: true },
  })

  schema.index({ key: 'text' })
  const model = mongoose.model('ConfigShift', schema, 'ConfigShift')
  return model 
}