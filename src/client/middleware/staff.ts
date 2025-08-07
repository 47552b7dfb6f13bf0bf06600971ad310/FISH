export default defineNuxtRouteMiddleware(async () => {
  try {
    const authStore = useAuthStore()
    if(!authStore.isLogin || !authStore.profile) throw 'Vui lòng đăng nhập trước'
    if(authStore.profile.type == undefined) throw 'Không tìm thấy thông tin quyền hạn'
    if(!authStore.isAdmin && !authStore.isSMod && !authStore.isStaff) throw 'Bạn không có quyền truy cập'
  }
  catch (e:any) {
    return navigateTo('/')
  }
})