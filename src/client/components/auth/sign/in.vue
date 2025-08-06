<template>
  <UForm :validate="validate" :state="state" @submit="submit">
    <UFormGroup label="Số điện thoại" name="phone">
      <UInput icon="i-bxs-user" v-model="state.phone" />
    </UFormGroup>

    <UFormGroup label="Mật khẩu" name="password">
      <UInput icon="i-bxs-lock" v-model="state.password" type="password" />
    </UFormGroup>

    <UiFlex justify="between" class="mt-6">
      <UiText pointer size="sm" color="gray" :disabled="!!loading" @click="emit('up')">Đăng ký tài khoản ngay ?</UiText>
      <UButton type="submit" :loading="loading" color="yellow">Đăng Nhập</UButton>
    </UiFlex>
  </UForm>
</template>

<script setup>
const emit = defineEmits(['done', 'up'])

const loading = ref(false)

const state = ref({
  phone: undefined,
  password: undefined
})

const validate = (state) => {
  const errors = []
  if (!state.phone) errors.push({ path: 'phone', message: 'Vui lòng nhập đầy đủ' })
  if (!state.password) errors.push({ path: 'password', message: 'Vui lòng nhập đầy đủ' })
  return errors
}

const submit = async () => {
  try {
    loading.value = true
    await useAPI('user/public/sign/in', JSON.parse(JSON.stringify(state.value)))

    loading.value = false
    emit('done')
  }
  catch (e) {
    loading.value = false
  }
}
</script>