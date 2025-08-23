import type { Types } from 'mongoose'

export interface IDBWheel {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  type: number
  voucher: Types.ObjectId
  name: string
  amount: number
  percent: number
}

export interface IDBWheelHistory {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  user: Types.ObjectId

  type: number
  voucher: Types.ObjectId
  name: string
  amount: number
  percent: number

  received: boolean
  giver: Types.ObjectId

  save: {
    () : void
  }
}