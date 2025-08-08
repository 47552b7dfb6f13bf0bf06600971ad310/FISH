import type { Model } from 'mongoose'

export { IDBConfig, IDBConfigShift, IDBConfigStore } from './config'
export { IDBUser } from './user'
export { IDBItemCategory, IDBItem, IDBItemImport, IDBItemExport } from './item'
export { IDBFishCategory, IDBFish } from './fish'
export { IDBLakeArea, IDBLakeSpot } from './lake'
export { IDBTicket, IDBTicketOrder, IDBTicketFish } from './ticket'

export interface IGlobalDB {
  Config: Model<IDBConfig>
  ConfigShift: Model<IDBConfigShift>

  User: Model<IDBUser>

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
  TicketFish: Model<IDBTicketFish>
}