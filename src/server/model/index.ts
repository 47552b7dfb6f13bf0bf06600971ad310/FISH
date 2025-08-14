import type { IGlobalDB } from '~~/types'
import type { Mongoose } from 'mongoose'

import { DBConfig, DBConfigShift } from './config'
import { DBUser, DBUserMemeber } from './user'
import { DBItemCategory, DBItem, DBItemExport, DBItemImport } from './item'
import { DBFishCategory, DBFish } from './fish'
import { DBLakeArea, DBLakeSpot } from './lake'
import { DBTicket, DBTicketOrder, DBTicketFish } from './ticket'
import { DBVoucher, DBVoucherHistory } from './voucher'
import { DBWheel, DBWheelHistory, DBWheelLucky } from './wheel'
import { DBLogUser, DBLogAddVoucher } from './log'


export default (mongoose : Mongoose) : IGlobalDB => {
  return {
    Config: DBConfig(mongoose),
    ConfigShift: DBConfigShift(mongoose),

    User: DBUser(mongoose),
    UserMember: DBUserMemeber(mongoose),

    ItemCategory: DBItemCategory(mongoose),
    Item: DBItem(mongoose),
    ItemImport: DBItemImport(mongoose),
    ItemExport: DBItemExport(mongoose),

    FishCategory: DBFishCategory(mongoose),
    Fish: DBFish(mongoose),

    LakeArea: DBLakeArea(mongoose),
    LakeSpot: DBLakeSpot(mongoose),

    Ticket: DBTicket(mongoose),
    TicketOrder: DBTicketOrder(mongoose),
    TicketFish: DBTicketFish(mongoose),

    Voucher: DBVoucher(mongoose),
    VoucherHistory: DBVoucherHistory(mongoose),

    Wheel: DBWheel(mongoose),
    WheelHistory: DBWheelHistory(mongoose),
    WheelLucky: DBWheelLucky(mongoose),

    LogUser: DBLogUser(mongoose),
    LogAddVoucher: DBLogAddVoucher(mongoose)
  }
}