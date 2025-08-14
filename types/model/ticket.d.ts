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
    complete: boolean
    staff: Types.ObjectId
  }
  
  time: {
    start: Date
    end: Date
    pay: Date
    delay: Date
  }

  price: {
    spot: number
    lunch: number
    item: number
    pig: number
    total: number
  }

  discount: {
    time: boolean
    lunch: boolean
    price: number
    miss: number
    voucher: Types.ObjectId
  }

  pay: {
    qrcode: string
    token: string
    type: string
    complete: boolean
    staff: Types.ObjectId
  }

  fish: {
    amount: number
    kg: number
  }

  cancel: {
    status: boolean
    staff: Types.ObjectId
  }

  status: number // 0: Pay Waiting, 1: Pay Success, 2: Start, 3: Before End, 4: End

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

  area: Types.ObjectId
  category: Types.ObjectId
  fish: Types.ObjectId

  amount: number
  kg: number

  proof: {
    live: string
    image: string
  }

  isPig: boolean
}