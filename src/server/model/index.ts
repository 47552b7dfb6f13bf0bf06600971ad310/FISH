import type { IGlobalDB } from '~~/types'
import type { Mongoose } from 'mongoose'

import { DBConfig, DBConfigShift } from './config'
import { DBUser } from './user'
import { DBItemCategory, DBItem, DBItemExport, DBItemImport } from './item'
import { DBFishCategory, DBFish } from './fish'
import { DBLakeArea, DBLakeSpot } from './lake'
import { DBTicket, DBTicketOrder, DBTicketFish } from './ticket'


export default (mongoose : Mongoose) : IGlobalDB => {
  return {
    Config: DBConfig(mongoose),
    ConfigShift: DBConfigShift(mongoose),

    User: DBUser(mongoose),

    ItemCategory: DBItemCategory(mongoose),
    Item: DBItem(mongoose),
    ItemImport: DBItemExport(mongoose),
    ItemExport: DBItemImport(mongoose),

    FishCategory: DBFishCategory(mongoose),
    Fish: DBFish(mongoose),

    LakeArea: DBLakeArea(mongoose),
    LakeSpot: DBLakeSpot(mongoose),

    Ticket: DBTicket(mongoose),
    TicketOrder: DBTicketOrder(mongoose),
    TicketFish: DBTicketFish(mongoose)
  }
}