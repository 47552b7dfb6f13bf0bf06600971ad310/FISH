import type { IDBLakeArea } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const { area } = await readBody(event)
    if(!area) throw 'Không tìm thấy thông tin khu vực'

    const areaCheck = await DB.LakeArea.findOne({ _id: area }).select('_id') as IDBLakeArea
    if(!areaCheck) throw 'Không tìm thấy thông tin khu vực'

    const list = await DB.LakeSpot
    .aggregate([
      { $match: { area: areaCheck._id }},
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