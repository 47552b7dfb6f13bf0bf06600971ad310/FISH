export default defineEventHandler(async (event) => {
  try {
    const { category } = await readBody(event)
    if(!category) throw 'Vui lòng chọn 1 danh mục dịch vụ'

    const match : any = { category: category, display: true }

    const list = await DB.Item
    .find(match)
    .populate({ path: 'category', select: 'name key' })
    .sort({ price: 1 })

    return resp(event, { result: list })
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})