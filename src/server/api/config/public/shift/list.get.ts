export default defineEventHandler(async (event) => {
  try {
    const list = await DB.ConfigShift.find({ display: true })
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})