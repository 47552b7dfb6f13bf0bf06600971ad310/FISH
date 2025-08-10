import type { Types } from 'mongoose'

export interface IDBVoucher {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  
  type: string
  title: string
  expired: date
  limit: number
  value: number
  display: boolean
}

export interface IDBVoucherHistory {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  
  voucher: Types.ObjectId
  user: Types.ObjectId
  ticket: Types.ObjectId
  content: string
}