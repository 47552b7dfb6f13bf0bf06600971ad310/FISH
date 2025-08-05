<template>
  <UiContent title="Kênh Thanh Toán"  sub="Chỉnh sửa thông tin kênh thanh toán cho khách">
    <UCard>
      <UForm :state="state">
        <UFormGroup label="Ngân hàng">
          <UInput v-model="state.gate.name" />
        </UFormGroup>

        <UFormGroup label="Số tài khoản">
          <UInput v-model="state.gate.number" />
        </UFormGroup>

        <UFormGroup label="Người hưởng thụ">
          <UInput v-model="state.gate.person" />
        </UFormGroup>

        <UFormGroup label="Prefix">
          <UInput v-model="state.gate.prefix" />
        </UFormGroup>

        <UFormGroup label="Khóa bí mật">
          <UInput v-model="state.gate.secret" />
        </UFormGroup>

        <UFormGroup label="QR Code">
          <UInput v-model="state.gate.qr" />
        </UFormGroup>

        <UiFlex justify="end" class="mt-4">
          <UButton color="yellow" @click="update('basic')" :loading="updating">Cập nhật</UButton>
        </UiFlex>
      </UForm>
    </UCard>
  </UiContent>
</template>

<script setup>
const { bootConfig } = useConfigStore()

const load = ref(true)
const updating = ref(false)

const state = ref({
  gate: {
    prefix: '',
    name: '',
    number: '',
    person: '',
    secret: '',
    qr: '',
  }
})

const getConfig = async () => {
  const config = await useAPI('config/manage/get')
  state.value = Object.assign(state.value, config)
  load.value = false
}

const update = async () => {
  try {
    updating.value = true
    await useAPI('config/manage/update', JSON.parse(JSON.stringify(state.value)))
    bootConfig()
    getConfig()
    updating.value = false
  }
  catch(e) {
    updating.value = false
  }
}

getConfig()
</script>