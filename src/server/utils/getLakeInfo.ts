export default async () => {
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const area = await DB.LakeArea
    .aggregate([
      { $lookup: {
          from: 'LakeSpot',
          let: { areaID: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$area', '$$areaID'] } } },
            { $project: { status: 1 }}
          ],
          as: 'spots'
        }
      },
      { $lookup: {
          from: 'Fish',
          let: { areaID: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$area', '$$areaID'] } } },
            { $lookup: {
              from: 'FishCategory',
              localField: 'category',
              foreignField: '_id',
              as: 'category'
            }},
            { $unwind: '$category' },
            { $lookup: {
              from: 'TicketFish',
              let: { fishID: '$_id' },
              pipeline: [
                { $match: { 
                  $expr: { $eq: ['$fish', '$$fishID'] },
                  createdAt: { $gte: startOfDay, $lte: endOfDay }
                }},
                { $group: {
                  _id: null,
                  amount: { $sum: '$amount' },
                  kg: { $sum: '$kg' }
                }}
              ],
              as: 'fishUp'
            }},
            { $addFields: {
              catchAmount: { $ifNull: [{ $first: '$fishUp.amount' }, 0] },
              catchKg: { $ifNull: [{ $first: '$fishUp.kg' }, 0] }
            }},
            { $group: {
              _id: '$category._id',
              name: { $first: '$category.name' },
              display: { $first: '$category.display' },
              nowAmount: { $sum: '$amount' },
              nowKg: { $sum: '$kg' },
              catchAmount: { $sum: '$catchAmount' },
              catchKg: { $sum: '$catchKg' }
            }}
          ],
          as: 'fishs'
        }
      },
      { $lookup: {
          from: 'Ticket',
          let: { areaID: '$_id' },
          pipeline: [
            { $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$area', '$$areaID'] },
                  { $gt: ['$status', 0] },
                  { $gte: ['$createdAt', startOfDay] },
                  { $lte: ['$createdAt', endOfDay] }
                ]
              }
            }},
            { $project: { price: 1 }}
          ],
          as: 'tickets'
        }
      },
      { $addFields: {
        spot: {
          online: { $size: {
            $filter: {
              input: '$spots',
              as: 'spot',
              cond: { $eq: ['$$spot.status', 3] }
            }
          }},
          empty: { $size: {
            $filter: {
              input: '$spots',
              as: 'spot',
              cond: { $eq: ['$$spot.status', 0] }
            }
          }}
        },
        revenue: {
          $sum: {
            $map: {
              input: "$tickets",
              as: "ticket",
              in: {
                $subtract: [
                  { $subtract: ["$$ticket.price.total", "$$ticket.price.item"] },
                  "$$ticket.price.pig"
                ]
              }
            }
          }
        }
      }},
      { $project: {
        spot: 1, name: 1, fishs: 1, revenue: 1, future: 1, pig: 1
      }}
    ])

    return Promise.resolve(area)
  }
  catch (e:any) {
    return Promise.resolve(null)
  }
}