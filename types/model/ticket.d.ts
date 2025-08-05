import type { Types } from 'mongoose'

export interface IDBTicket {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  user: Types.ObjectId
  area: Types.ObjectId
  spot: Types.ObjectId
  shift: Types.ObjectId

  lunch: {
    has: boolean,
    status: number
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
  pay: number

  complete: {
    pay: boolean
    time: boolean
  }

  save: {
    () : void
  }
}