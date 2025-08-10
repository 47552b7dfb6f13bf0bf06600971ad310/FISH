import { IAuth, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const list = await DB.LakeSpot
    .aggregate([
      {
        $lookup: {
          from: "Ticket",
          let: { spotId: "$_id" },
          pipeline: [
            { $match: { $expr: { $and: [
              { $eq: ["$spot", "$$spotId"] },
              { $eq: ["$cancel.status", false] }
            ]}}},
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: "ticket"
        }
      },
      { $unwind: { path: "$ticket", preserveNullAndEmptyArrays: true } }
    ])

    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})