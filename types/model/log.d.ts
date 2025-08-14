import type { Types } from 'mongoose'

export interface IDBLogUser {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  
  type: string
  user: Types.ObjectId
  action: string
}

export interface IDBLogAddVoucher {
  staff: Types.ObjectId
  user: Types.ObjectId
  voucher: Types.ObjectId
}