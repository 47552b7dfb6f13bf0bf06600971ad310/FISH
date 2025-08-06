export default defineEventHandler(async (event) => {
  try {
    const list = await DB.LakeArea.find()
    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { result: [] })
  }
})