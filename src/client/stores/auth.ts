import { defineStore } from 'pinia'
import type { IAuth } from '~~/types'

export const useAuthStore = defineStore('auth', () => {
  const modal = ref(false)
  const isLogin = ref(false)
  const isAdmin = ref(false)
  const isSMod = ref(false)
  const isStaff = ref(false)
  const profile : Ref<IAuth | undefined> = ref(undefined)

  function setModal (data : boolean) {
    modal.value = data
  }

  async function setAuth () {
    const auth = await useAPI('user/public/get', undefined, {
      key: `admin/get-${Date.now()}`,
    })
    isLogin.value = true
    isAdmin.value = auth.type == 3
    isSMod.value = auth.type == 2
    isStaff.value = auth.type == 1
    profile.value = auth 
  }

  async function removeAuth () {
    await useAPI('user/public/sign/out')
    isLogin.value = false
    isAdmin.value = false
    isSMod.value = false
    isStaff.value = false
    profile.value = undefined
  }

  function getMember () {
    if(!isLogin.value || !profile.value) return null
    const member = profile.value.member
    if(!!member.week.enable) return member.week
    if(!!member.month.enable) return member.month
    return null
  }

  function getMemberType () {
    if(!isLogin.value || !profile.value) return null
    const member = profile.value.member
    if(!!member.week.enable) return 'week'
    if(!!member.month.enable) return 'month'
    return null
  }

  return { 
    modal,
    isLogin, 
    isAdmin,
    isSMod,
    isStaff,
    profile,
    setModal,
    setAuth, 
    removeAuth,
    getMember,
    getMemberType
  }
})