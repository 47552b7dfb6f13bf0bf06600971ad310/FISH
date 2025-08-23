import type { Types } from 'mongoose'

export interface IDBSpend {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  user: Types.ObjectId
  title: string
  money: number
  reason: string
  images: Array<string>
  time: Date
}