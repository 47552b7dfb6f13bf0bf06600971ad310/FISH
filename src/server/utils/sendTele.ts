import axios from 'axios'

interface ISendData {
  url: string
  message: string
}

export default async (data : ISendData) : Promise<boolean> => {
  try {
    if(!data.url || !data.message) throw true
    await axios.post(data.url, data)
    return true
  }
  catch (e:any) {
    return false
  }
}