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

  area: Types.ObjectId
  category: Types.ObjectId
  amount: number
  kg: number
  time: Date
  price: number
  isPig: boolean

  save: {
    () : void
  }
}