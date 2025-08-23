export default defineEventHandler(async (event) => {
  try {
    const list = await DB.Wheel.find({ type: { $gt: 0 } })
    .sort({ percent: 'asc' })
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})