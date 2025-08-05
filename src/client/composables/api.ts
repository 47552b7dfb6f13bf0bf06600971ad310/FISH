import type { IResp } from '~~/types'

export const useAPI = async (path : string, post?: any, options: any = {}) => {
  const { removeAuth } = useAuthStore()
  
  const option = {
    method: !!post ? 'POST' : 'GET',
    body: !!post ? post : null,
    headers: {
      // 'Cache-Control': 'no-store',
      ...options.headers,
    },
    // cache: 'no-cache', 
    // key: `${path}-${Date.now()}`,
    ...options
  }

  try {
    const { data, error } = await useFetch(`/api/${path}`, option)

    if(error.value) {
      const statusCode = error.value.statusCode
      const message = error.value.message
      if(import.meta.server){
        throw createError({ statusCode, message })
      }
      if(import.meta.client){
        showError({ statusCode, statusMessage:message })
        return Promise.reject(false)
      }
    }
    else {
      if(!data.value) return Promise.reject(false)
      const { code, message, result } = data.value as IResp
    
      if(!!message && import.meta.client){
        if(code == 200) useNotify().success(message)
        else useNotify().error(message)
      }

      if(code == 200) {
        return Promise.resolve(result || null)
      }
      else if(code == 500){
        if(import.meta.server){
          throw createError({ statusCode:code, message:message })
        }
        if(import.meta.client){
          showError({ statusCode:code, statusMessage:message })
          return Promise.reject(message)
        }
      }
      else if(code == 401) { 
        if(import.meta.client) await removeAuth()
        return Promise.reject(message)
      }
      else {
        return Promise.reject(message)
      }
    }
  } 
  catch (error: any) {
    const statusCode = error?.statusCode ?? 500
    const message = error?.message ?? 'Lỗi API không xác định'
    if (import.meta.server) {
      throw createError({ statusCode, message })
    }
    if (import.meta.client) {
      showError({ statusCode, statusMessage: message })
    }
    return Promise.reject(false)
  }
}