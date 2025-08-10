import { IAuth, IDBUser } from "~~/types"

interface IDataMember {
  type: string,
  data: IDBUser['member']['month'] | IDBUser['member']['week']
}

export default (data : IDBUser['member']) : IDataMember | null => {
  if(data.week.enable) return {
    type: 'week',
    data: data.week
  }
  if(data.month.enable) return {
    type: 'month',
    data: data.month
  }
  return null
}