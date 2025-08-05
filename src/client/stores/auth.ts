import { defineStore } from 'pinia'
import type { IAuth } from '~~/types'

export const useAuthStore = defineStore('auth', () => {
  const isLogin = ref(false)
  const profile : Ref<IAuth | undefined> = ref(undefined)

  async function setAuth () {
    const auth = await useAPI('user/public/get', undefined, {
      key: `admin/get-${Date.now()}`,
    })
    isLogin.value = true
    profile.value = auth 
  }

  async function removeAuth () {
    await useAPI('user/public/sign/out')
    isLogin.value = false
    profile.value = undefined
  }

  return { 
    isLogin, 
    profile,
    setAuth, 
    removeAuth
  }
})