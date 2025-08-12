import { Types } from 'mongoose'
import type { IDBUser } from '../model'

export interface IAuth {
  _id: Types.ObjectId
  phone: string
  name: string
  type: number
  currency: IDBUser['currency']
  member: IDBUser['member']
  statistic: IDBUser['statistic']
}

export interface IResp {
  code? : number
  message?: string
  result?: any
}

export interface IFormatDate {
  day: number
  week: number
  month: number
  year: number
  hour: number
  minute: number
  timestamp: number
  source: any
  dayjs: any
}