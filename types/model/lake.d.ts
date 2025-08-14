import type { Types } from 'mongoose'

export interface IDBLakeArea {
  _id: Types.ObjectId

  name: string
  key: string
  description: string
  image: string
  future: {
    price: number
    percent: number
  }
  pig: {
    money: number
    max: number
  }
}

export interface IDBLakeSpot {
  _id: Types.ObjectId

  area: Types.ObjectId
  code: string
  status: number

  save: {
    () : void
  }
}