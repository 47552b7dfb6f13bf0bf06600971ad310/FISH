<template>
  <UiFlex type="col" justify="center" class="p-6 w-full min-h-screen">
    <UCard class="bg-card min-w-[300px]">
      <UiText size="base" weight="semibold" class="mb-4">Xác minh quyền truy cập</UiText>

      <UForm :state="state" @submit="submit">
        <UFormGroup>
          <UInput v-model="state.phone" icon="i-bxs-user" type="text" placeholder="Nhập số điện thoại" :disabled="loading" />
        </UFormGroup>

        <UFormGroup>
          <UInput v-model="state.password" icon="i-bxs-lock" type="password" placeholder="Nhập mật khẩu" :disabled="loading" />
        </UFormGroup>

        <UiFlex justify="end" class="mt-4">
          <UButton type="submit" color="yellow" :loading="loading">Xác nhận</UButton>
        </UiFlex>
      </UForm>
    </UCard>
  </UiFlex>
</template>

<script setup>
definePageMeta({
  layout: false
})

const authStore = useAuthStore()

const loading = ref(false)

const state = ref({
  phone: null,
  password: null
})

const submit = async () => {
  try {
    loading.value = true
    await useAPI('user/public/sign/in', JSON.parse(JSON.stringify(state.value)))
    await authStore.setAuth()
    navigateTo('/manage')
  }
  catch(e){
    loading.value = false
  }
}
</script>