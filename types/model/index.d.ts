import type { Model } from 'mongoose'

export { IDBConfig, IDBConfigShift, IDBConfigStore } from './config'
export { IDBUser, IDBUserMember, IDBUserShift } from './user'
export { IDBItemCategory, IDBItem, IDBItemImport, IDBItemExport } from './item'
export { IDBFishCategory, IDBFish } from './fish'
export { IDBLakeArea, IDBLakeSpot } from './lake'
export { IDBTicket, IDBTicketConnect, IDBTicketOrder, IDBTicketFish } from './ticket'
export { IDBVoucher, IDBVoucherHistory } from './voucher'
export { IDBWheel, IDBWheelHistory } from './wheel'
export { IDBLogUser, IDBLogAddVoucher } from './log'
export { IDBSpend } from './spend'

export interface IGlobalDB {
  Config: Model<IDBConfig>
  ConfigShift: Model<IDBConfigShift>

  User: Model<IDBUser>
  UserMember: Model<IDBUserMember>
  UserShift: Model<IDBUserShift>

  ItemCategory: Model<IDBItemCategory>
  Item: Model<IDBItem>
  ItemImport: Model<IDBItemImport>
  ItemExport: Model<IDBItemExport>

  FishCategory: Model<IDBFishCategory>
  Fish: Model<IDBFish>

  LakeArea: Model<IDBLakeArea>
  LakeSpot: Model<IDBLakeSpot>

  Ticket: Model<IDBTicket>
  TicketOrder: Model<IDBTicketOrder>
  TicketConnect: Model<IDBTicketConnect>
  TicketFish: Model<IDBTicketFish>

  Voucher: Model<IDBVoucher>
  VoucherHistory: Model<IDBVoucherHistory>

  Wheel: Model<IDBWheel>
  WheelHistory: Model<IDBWheelHistory>

  LogUser: Model<IDBLogUser>
  LogAddVoucher: Model<IDBLogAddVoucher>

  Spend: Model<IDBSpend>
}