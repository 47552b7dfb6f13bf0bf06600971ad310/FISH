import type { IAuth } from '~~/types'

export default defineEventHandler(async (event) => {
  try {
    const { type } = await readBody(event)
    if(!type) throw 'Dữ liệu đầu vào không đủ'

    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không phải quản trị viên'

    let start : any, end : any, format : any
    let ticket : any, signup : any, item : any, member : any
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

    // Not Total
    if(type != 'total'){
      const match : any = {}
      match['time'] = { $gte: new Date(start['$d']), $lte: new Date(end['$d']) }

      ticket = await DB.Ticket.aggregate([
        { $match: { 'pay.complete': true }},
        {
          $project: {
            createdAt: 1,
            timeformat: {
              $dateToString: { format: format, date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
            },
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', '$price.item' ] },
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', '$price.item' ] },
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
        { $match: { 'status': { $eq: 1 } }},
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
        { $match: { 'status': { $eq: 1 } }},
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
            money: { $sum: '$money' },
          }
        },
        { $match: match }
      ])

      signup = await DB.User.aggregate([
        {
          $project: {
            createdAt: 1,
            timeformat: {
              $dateToString: { format: format, date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' }
            }
          }
        },
        {
          $group: {
            _id: '$timeformat',
            time: { $min: '$createdAt' },
            count: { $count: {} },
          }
        },
        { $match: match }
      ])
    }

    // Is Total
    if(type == 'total') {
      ticket = await DB.Ticket.aggregate([
        { $match: { 'pay.complete': true }},
        {
          $project: {
            bank: {
              $cond: [
                { $eq: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', '$price.item' ] },
                0
              ]
            },
            money: {
              $cond: [
                { $ne: ['$pay.type', 'BANK'] },
                { $subtract: [ '$price.total', '$price.item' ] },
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
        { $match: { 'status': { $eq: 1 } }},
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
            time: { $min: '$createdAt' },
            bank: { $sum: '$bank' },
            money: { $sum: '$money' },
          }
        }
      ])

      member = await DB.UserMember.aggregate([
        { $match: { 'status': { $eq: 1 } }},
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

      const users = await DB.User.count()
      signup = [{ count: users }]
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
        member: member[0] ? member[0]['money'] : 0,
        signup: signup[0] ? signup[0]['count'] : 0,
      }
    })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})