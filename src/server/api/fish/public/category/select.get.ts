export default defineEventHandler(async (event) => {
  try {
    const list = await DB.FishCategory.find().select('name')
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})