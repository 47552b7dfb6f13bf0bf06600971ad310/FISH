import type { Types } from 'mongoose'

export interface IDBUser {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  
  phone: string
  password: string
  showpass: string

  name: string
  key: string
  email: string
  type: number
  token: string

  currency: {
    wheel: number
  }

  member: {
    week: {
      enable: boolean
      end: Date
      discount: number
      free: {
        lunch: number
        time: number
      }
    },
    month: {
      enable: { type: Boolean, default: false },
      end: Date
      discount: number
      free: {
        lunch: number
        time: number
      }
    }
  }

  vouchers: Array<Types.ObjectId | IDBVoucher>

  save: {
    () : void
  }
}

export interface IDBUserMember {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  user: Types.ObjectId
  code: string
  type: string
  price: number
  money: number
  qrcode: string
  token: string
  status: number
  verify: {
    person: Types.ObjectId
    time: Date
    reason: string
  }

  save: {
    () : void
  }
}