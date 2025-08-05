import type { Types } from 'mongoose'

export interface IDBItemCategory {
  _id: Types.ObjectId

  name: string
  key: string
}

export interface IDBItem {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  category: Types.ObjectId
  name: string
  key: string
  description: string
  image: string
  price: number
  inventory: number
  display: boolean
}

export interface IDBItemImport {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  user: Types.ObjectId
  category: Types.ObjectId
  item: Types.ObjectId
  amount: number
  price: number
  note: string
}

export interface IDBItemExport {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date

  ticket: Types.ObjectId
  user: Types.ObjectId
  category: Types.ObjectId
  item: Types.ObjectId
  amount: number
  price: number
  note: string
}