export default defineEventHandler(async (event) => {
  try {
    const list = await DB.User.find({ type: { $gt: 0 } }).select('name phone')
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})