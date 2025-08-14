<template>
  <UiContent title="Tặng Voucher" sub="Chức năng tặng voucher cho người dùng" class="max-w-2xl mx-auto">
    <UCard>
      <UForm :state="state">
        <UFormGroup label="Số điện thoại">
          <UInput v-model="state.phone" />
        </UFormGroup>

        <UFormGroup label="Thẻ Voucher">
          <SelectVoucherManage v-model="state.voucher" />
        </UFormGroup>

        <UiFlex justify="between" class="gap-1 mt-4">
          <UButton color="gray" @click="navigateTo('/manage/user/voucher/history')">Xem lịch sử</UButton>
          <UButton color="yellow" @click="add" :loading="loading">Xác Nhận</UButton>
        </UiFlex>
      </UForm>
    </UCard>
  </UiContent>
</template>

<script setup>
const loading = ref(false)

const state = ref({
  phone: null,
  voucher: null
})

const add = async () => {
  try {
    loading.value = true
    await useAPI('user/manage/add/voucher/action', JSON.parse(JSON.stringify(state.value)))

    loading.value = false
  }
  catch(e) {
    loading.value = false
  }
}
</script>