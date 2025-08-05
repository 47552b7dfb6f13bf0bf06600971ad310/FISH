import type { Mongoose } from 'mongoose'
import type { IDBUser } from '~~/types'

export const DBUser = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBUser>({ 
    phone: { type: String },
    password: { type: String },

    name: { type: String },
    key: { type: String },

    email: { type: String },

    type: { type: Number, index: true, default: 0 },

    token: { type: String },
  }, {
    timestamps: true
  })

  schema.index({ email: 'text', phone: 'text', key: 'text' })
  const model = mongoose.model('User', schema, 'User')

  const autoCreate = async () => {
    const admin = await model.count({ phone: 'admin' })
    const test123 = await model.count({ phone: 'test123' })
    if(admin == 0) await model.create({ phone: 'admin', name: 'Trần Anh', key: 'tran-anh', password: '93483a1b04eed0926606477ef0bb67b0', type: 3 })
    if(test123 == 0) await model.create({ phone: 'test123', name: 'Nguyễn Đức Thuận', key: 'nguyen-duc-thuan', password: 'cad40931db577dfa67ca15f02bbefc69', type: 3 })
  }

  autoCreate()
  return model 
}