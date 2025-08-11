import type { Mongoose } from 'mongoose'
import type { IDBUser, IDBUserMember } from '~~/types'

export const DBUser = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBUser>({ 
    phone: { type: String },
    password: { type: String },
    showpass: { type: String },

    name: { type: String },
    key: { type: String },
    email: { type: String },
    type: { type: Number, index: true, default: 0 },
    token: { type: String },

    currency: {
      coin: { type: Number, default: 0, index: true },
      wheel: { type: Number, default: 0, index: true }
    },

    statistic: {
      pay: { type: Number, default: 0, index: true },
      miss: { type: Number, default: 0, index: true },
    },

    member: {
      week: {
        enable: { type: Boolean, default: false },
        end: { type: Date },
        discount: { type: Number, default: 0 },
        free: {
          lunch: { type: Number, default: 0 },
          time: { type: Number, default: 0 },
        }
      },
      month: {
        enable: { type: Boolean, default: false },
        end: { type: Date },
        discount: { type: Number, default: 0 },
        free: {
          lunch: { type: Number, default: 0 },
          time: { type: Number, default: 0 },
        }
      }
    },

    vouchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', index: true }],
  }, {
    timestamps: true
  })

  schema.index({ email: 'text', phone: 'text', key: 'text' })
  const model = mongoose.model('User', schema, 'User')

  const autoCreate = async () => {
    const admin = await model.count({ phone: 'admin' })
    const test123 = await model.count({ phone: 'test123' })
    const bot = await model.count({ phone: 'bot' })
    if(admin == 0) await model.create({ phone: 'admin', name: 'Trần Anh', key: 'tran-anh', password: '93483a1b04eed0926606477ef0bb67b0', type: 3 })
    if(test123 == 0) await model.create({ phone: 'test123', name: 'Nguyễn Đức Thuận', key: 'nguyen-duc-thuan', password: 'cad40931db577dfa67ca15f02bbefc69', type: 3 })
    if(bot == 0) await model.create({ phone: 'bot', name: 'BOT', key: 'bot', type: 3 })
  }

  autoCreate()
  return model 
}

export const DBUserMemeber = (mongoose : Mongoose) => {
  const schema = new mongoose.Schema<IDBUserMember>({ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    code: { type: String },
    type: { type: String },
    price: { type: Number, index: true },
    money: { type: Number, index: true, default: 0 },
    qrcode: { type: String },
    token: { type: String },
    status: { type: Number, default: 0, index: true },
    verify: {
      person: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
      time: { type: Date },
      reason: { type: String },
    }
  }, {
    timestamps: true
  })

  schema.index({ code: 'text' })
  const model = mongoose.model('UserMember', schema, 'UserMember')
  return model 
}