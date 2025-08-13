
export default defineEventHandler(async (event) => {
  try {
    const startOfWeek = DayJS().isoWeekday(1).startOf('day').toDate()
    const endOfWeek = DayJS().isoWeekday(7).endOf('day').toDate()

    const ranking = await DB.TicketFish.aggregate([
      { $match: {
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
      }},
      { $group: {
          _id: '$user',
          totalAmount: { $sum: '$amount' },
          totalKg: { $sum: '$kg' }
      }},
      { $lookup: {
          from: 'User', 
          localField: '_id',
          foreignField: '_id',
          pipeline: [
            { $project: { _id: 0, name: 1 }}
          ],
          as: 'user'
      }},
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: 1,
          totalAmount: 1,
          totalKg: 1
        }
      },
      {
        $setWindowFields: {
          sortBy: { totalAmount: -1 },
          output: {
            rank: {
              $documentNumber: {}
            }
          }
        }
      },
      { $match: { rank: { $lte: 10 } } }, // Lấy top 10
      { $sort: { rank: 1 } } // Sắp xếp theo thứ hạng
    ])

    return resp(event, { result: ranking })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})