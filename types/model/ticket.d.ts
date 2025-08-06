import type { Types } from 'mongoose'

export interface IDBTicket {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  user: Types.ObjectId

  area: Types.ObjectId
  spot: Types.ObjectId
  shift: Types.ObjectId

  code: string

  lunch: {
    has: boolean,
    price: number
  }

  items: Array<Types.ObjectId>
  
  overtime: {
    step: number
    price: number
  }

  start: Date
  end: Date

  total: number

  pay: {
    total: number
    pending: Date
    qrcode: string
    token: string
    type: string
  }

  complete: {
    pay: {
      total: boolean
      pending: boolean
    }
    time: boolean
    lunch: boolean
  },

  cancel: boolean

  save: {
    () : void
  }
}