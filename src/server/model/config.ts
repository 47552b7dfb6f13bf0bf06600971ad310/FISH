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
    name: { type: String },
    key: { type: String },
    duration: { type: Number, index: true },
    price: { type: Number, index: true },
    display: { type: Boolean, index: true, default: true },
  })

  schema.index({ key: 'text' })
  const model = mongoose.model('ConfigShift', schema, 'ConfigShift')

  const autoCreate = async () => {
    const ca4 = await model.count({ key: 'ca-4-tieng' })
    const ca6 = await model.count({ key: 'ca-6-tieng' })
    const ca8 = await model.count({ key: 'ca-8-tieng' })
    const ca12 = await model.count({ key: 'ca-12-tieng' })
    if(ca4 == 0) await model.create({ name: 'Ca 4 tiếng', key: 'ca-4-tieng', duration: 4, price: 200000 })
    if(ca6 == 0) await model.create({ name: 'Ca 6 tiếng', key: 'ca-6-tieng', duration: 6, price: 300000 })
    if(ca8 == 0) await model.create({ name: 'Ca 8 tiếng', key: 'ca-8-tieng', duration: 8, price: 400000 })
    if(ca12 == 0) await model.create({ name: 'Ca 12 tiếng', key: 'ca-12-tieng', duration: 12, price: 600000 })
  }

  autoCreate()
  return model 
}