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
    coin: number
    wheel: number
    pig: number
  }

  statistic: {
    pay: number
    payweek: number
    miss: number
  }

  charity: {
    week: number
    month: number
    total: number
  }

  member: {
    week: {
      enable: boolean
      end: date
      discount: number
      free: {
        lunch: number
        time: number
      }
    },
    month: {
      enable: boolean
      end: date
      discount: number
      free: {
        lunch: number
        time: number
      }
    }
  }

  vouchers: Array<Types.ObjectId | IDBVoucher>

  login: {
    update: date
  }

  guestauto: boolean

  save: {
    () : void
  }
}

export interface IDBUserMember {
  _id: Types.ObjectId
  createdAt: date
  updatedAt: date

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
    time: date
    reason: string
  }

  save: {
    () : void
  }
}