import type { Types } from 'mongoose'

export interface IDBUser {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
  
  phone: string
  password: string

  name: string
  key: string

  email: string

  type: number
  
  token: string

  save: {
    () : void
  }
}