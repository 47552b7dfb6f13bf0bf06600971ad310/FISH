export default defineEventHandler(async (event) => {
  try {
    const list = await DB.Item
    .find()
    .populate({ path: 'category', select: 'name key' })
    .sort({ price: 1 })

    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})