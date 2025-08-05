<template>
  <UiFlex type="col" justify="center" class="p-6 w-full min-h-screen">
    <UiText color="rose" class="SVN" weight="bold" align="center" style="font-size: 8rem">
      {{ error.statusCode }}
    </UiText>
    <UiText color="gray" size="2xl" align="center" class="UT -mt-6 mb-6">
      {{ error.message || error.statusMessage || 'Có lỗi xảy ra' }}
    </UiText>
    <UButton color="gray" class="px-4" @click="goBackOrHome">{{ !!canGoBack ? 'Quay Lại' : 'Trang Chủ' }}</UButton>
  </UiFlex>
</template>

<script setup>
const router = useRouter()
const props = defineProps({
  error: Object
})

const previousUrl = ref('')
const canGoBack = ref(false)

const goBackOrHome = () => {
  if (canGoBack.value) {
    router.back()
  } else {
    navigateTo('/')
  }
}

onMounted(() => {
  if (process.client) {
    previousUrl.value = document.referrer
    const isSameOrigin = previousUrl.value.startsWith(window.location.origin)
    canGoBack.value = isSameOrigin && window.history.length > 1
  }
})
</script>