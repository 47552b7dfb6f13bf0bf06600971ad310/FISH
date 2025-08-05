import type { Types } from 'mongoose'

export interface IDBFishCategory {
  _id: Types.ObjectId

  name: string
  key: string
  description: string
}

export interface IDBFish {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  category: Types.ObjectId
  amount: number
  kg: number
  time: Date

  save: {
    () : void
  }
}