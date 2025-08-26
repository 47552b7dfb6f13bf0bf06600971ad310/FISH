import { Types } from 'mongoose'
import type { IAuth } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const { type, staff, range } = await readBody(event)
    if(!type) throw 'Dữ liệu đầu vào không đủ'
    if(type == 'total' && !range) throw 'Dữ liệu đầu vào không đủ'

    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    let start : any, end : any, format : any
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

    // Total
    if(type == 'total'){
      if(!!range['start'] && !!range['end']){
        start = DayJS(range['start']).startOf('date')
        end = DayJS(range['end']).endOf('date')
      }

      format = '%Y-%m-%d'
    }

    // Set Match
    const matchTicket : any = { 'pay.complete': true }
    const matchItem : any = { 'status': { $eq: 1 } }
    const matchConnect : any = { 'status': { $eq: 1 } }
    if(!!staff){
      matchTicket['pay.staff'] = new Types.ObjectId(staff)
      matchItem['staff'] = new Types.ObjectId(staff)
      matchConnect['staff'] = new Types.ObjectId(staff)
    }
    const match : any = {}
    if(!!start && !!end) match['time'] = { $gte: new Date(start['$d']), $lte: new Date(end['$d']) }

    // Get Data
    const ticket = await DB.Ticket.aggregate([
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
      { $match: match },
      {
        $group: {
          _id: null,
          bank: { $sum: '$bank' },
          money: { $sum: '$money' },
        }
      },
    ])

    const item = await DB.TicketOrder.aggregate([
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
      { $match: match },
      {
        $group: {
          _id: null,
          bank: { $sum: '$bank' },
          money: { $sum: '$money' },
        }
      },
    ])

    const connect = await DB.TicketConnect.aggregate([
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
      { $match: match },
      {
        $group: {
          _id: null,
          bank: { $sum: '$bank' },
          money: { $sum: '$money' },
        }
      },
    ])

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
        }
      }
    })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})