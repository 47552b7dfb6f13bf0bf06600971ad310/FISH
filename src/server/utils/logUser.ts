import type { Types } from 'mongoose'

interface IData {
  user: Types.ObjectId
  action: string
  type: string
}

export default async (data : IData) => {
  await DB.LogUser.create(data)
}