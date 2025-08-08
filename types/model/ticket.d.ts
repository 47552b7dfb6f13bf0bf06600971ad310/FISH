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
    has: boolean
    price: number
    staff: Types.ObjectId
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
    order: number
    pending: Date
    qrcode: string
    token: string
    type: string
  }

  complete: {
    pay: {
      total: boolean
      pending: boolean
      staff: Types.ObjectId
    }
    time: boolean
    lunch: boolean
    cancel: Types.ObjectId
  },

  fish: {
    amount: number
    kg: number
  }

  cancel: boolean

  status: number // 0-PENDING 1-STARTING 2-END

  save: {
    () : void
  }
}

export interface IDBTicketOrder {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  ticket: Types.ObjectId
  user: Types.ObjectId

  code: string

  cart: Array<{
    item: Types.ObjectId
    amount: number
    price: number
  }>

  total: number

  status: number // 0 - Pending, 1 - Success

  pay: {
    type: string
    qrcode: string
    token: string
  }

  staff: Types.ObjectId

  save: {
    () : void
  }
}

export interface IDBTicketFish {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  staff: Types.ObjectId
  
  ticket: Types.ObjectId
  user: Types.ObjectId

  category: Types.ObjectId
  fish: Types.ObjectId

  amount: number
  kg: number

  proof: {
    live: string
    image: string
  }
}