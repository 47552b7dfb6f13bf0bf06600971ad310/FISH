import {  } from "~~/types"

export default defineEventHandler(async (event) => {
  try {
    const area = await getLakeInfo()
    return resp(event, { result: area } )
  } 
  catch (e:any) {
    return resp(event, { code: 400, message: e.toString() })
  }
})