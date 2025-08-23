import { Types } from 'mongoose'
import type { IAuth } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const { type } = await readBody(event)
    if(!type) throw 'Dữ liệu đầu vào không đủ'

    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    let start : any, end : any, format : any
    let ticket : any, item : any, connect : any, member : any, spend : any
    const now = DayJS(Date.now())
    const yesterday = now.add(-1, 'day')
    const lastmonth = now.add(-1, 'month')

    // Today, Yesterday
    if(type == 'today' || type == 'yesterday'){
      if(type == 'today'){
        start = now.startOf('date')
        end = now.endOf('date')
      }
      if(type == 'yesterday'){
        start = yesterday.startOf('date')
        end = yesterday.endOf('date')
      }

      format = '%Y-%m-%d'
    }

    // This Month, Last Month
    if(type == 'month' || type == 'lastmonth'){
      if(type == 'month'){
        start = now.startOf('month')
        end = now.endOf('month')
      }
      if(type == 'lastmonth'){
        start = lastmonth.startOf('month')
        end = lastmonth.endOf('month')
      }
      
      format = '%Y-%m'
    }

    // Set Match
    const matchTicket : any = { 'pay.complete': true }
    const matchItem : any = { 'status': { $eq: 1 } }
    const matchConnect : any = { 'status': { $eq: 1 } }
    const matchMember : any = { 'status': { $eq: 1 } }
    const matchSpend : any = {}

    // Not Total
    if(type != 'total'){
      const match : any = {}
      match['time'] = { $gte: new Date(start['$d']), $lte: new Date(end['$d']) }

      ticket = await DB.Ticket.aggregate([
        { $match: matchTicket},
        {
          $project: {
            createdAt: 1,
            timeformat: {
              $dateToString: { format: format, date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
            },
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', { $add: ['$price.item', '$price.connect'] } ] },
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', { $add: ['$price.item', '$price.connect'] } ] },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: '$timeformat',
            time: { $min: '$createdAt' },
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        },
        { $match: match }
      ])

      item = await DB.TicketOrder.aggregate([
        { $match: matchItem},
        {
          $project: {
            createdAt: 1,
            timeformat: {
              $dateToString: { format: format, date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
            },
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: '$timeformat',
            time: { $min: '$createdAt' },
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        },
        { $match: match }
      ])

      connect = await DB.TicketConnect.aggregate([
        { $match: matchConnect },
        {
          $project: {
            createdAt: 1,
            timeformat: {
              $dateToString: { format: format, date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
            },
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: '$timeformat',
            time: { $min: '$createdAt' },
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        },
        { $match: match }
      ])

      member = await DB.UserMember.aggregate([
        { $match: matchMember },
        {
          $project: {
            createdAt: 1,
            timeformat: {
              $dateToString: { format: format, date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
            },
            money: '$price'
          }
        },
        {
          $group: {
            _id: '$timeformat',
            time: { $min: '$createdAt' },
            money: { $sum: '$money' },
          }
        },
        { $match: match }
      ])

      spend = await DB.Spend.aggregate([
        {
          $project: {
            time: 1,
            timeformat: {
              $dateToString: { format: format, date: '$time', timezone: 'Asia/Ho_Chi_Minh' }
            },
            money: 1
          }
        },
        {
          $group: {
            _id: '$timeformat',
            time: { $min: '$time' },
            money: { $sum: '$money' },
          }
        },
        { $match: match }
      ])
    }

    // Is Total
    if(type == 'total') {
      ticket = await DB.Ticket.aggregate([
        { $match: matchTicket},
        {
          $project: {
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', { $add: ['$price.item', '$price.connect'] } ] },
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', { $add: ['$price.item', '$price.connect'] } ] },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        }
      ])

      item = await DB.TicketOrder.aggregate([
        { $match: matchItem},
        {
          $project: {
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        }
      ])

      connect = await DB.TicketConnect.aggregate([
        { $match: matchConnect },
        {
          $project: {
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                '$total',
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        }
      ])

      member = await DB.UserMember.aggregate([
        { $match: matchMember },
        {
          $project: {
            money: '$price'
          }
        },
        {
          $group: {
            _id: null,
            money: { $sum: '$money' },
          }
        }
      ])

      spend = await DB.Spend.aggregate([
        { $match: matchMember },
        {
          $project: {
            money: 1
          }
        },
        {
          $group: {
            _id: null,
            money: { $sum: '$money' },
          }
        }
      ])
    }

    // Result
    return resp(event, {
      result: {
        ticket: {
          bank: ticket[0] ? ticket[0]['bank'] : 0,
          money: ticket[0] ? ticket[0]['money'] : 0,
        },
        item: {
          bank: item[0] ? item[0]['bank'] : 0,
          money: item[0] ? item[0]['money'] : 0,
        },
        connect: {
          bank: connect[0] ? connect[0]['bank'] : 0,
          money: connect[0] ? connect[0]['money'] : 0,
        },
        member: member[0] ? member[0]['money'] : 0,
        spend: spend[0] ? spend[0]['money'] : 0,
      }
    })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})