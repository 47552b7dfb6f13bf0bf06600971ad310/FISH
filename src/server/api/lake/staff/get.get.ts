import { IAuth, IDBLakeSpot, IDBTicket } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const auth = await getAuth(event) as IAuth
    if(auth.type < 1) throw 'Bạn không có quyền truy cập'

    const list = await DB.LakeArea
    .aggregate([
      {
        $lookup: {
          from: "LakeSpot",
          localField: "_id",
          foreignField: "area",
          as: "spots"
        }
      },
      { $addFields: { count: {  $size: '$spots' }}}
    ])

    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})