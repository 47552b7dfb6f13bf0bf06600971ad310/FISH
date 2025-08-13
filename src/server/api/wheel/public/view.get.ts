export default defineEventHandler(async (event) => {
  try {
    const list = await DB.Wheel.find({ type: 1 })
    .sort({ percent: 'desc' })
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})