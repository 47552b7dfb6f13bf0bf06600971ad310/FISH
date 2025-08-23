export default defineEventHandler(async (event) => {
  try {
    const list = await DB.Wheel.find({ amount: { $gt: 0 } })
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 500, message: e.toString() })
  }
})