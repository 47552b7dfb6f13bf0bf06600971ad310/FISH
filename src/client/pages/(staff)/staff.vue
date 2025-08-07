<template>
  <div>
    <UiFlex class="mb-2">
      <UTabs v-model="tab" :items="tabs"></UTabs>
    </UiFlex>

    <Transition name="page" mode="out-in">
      <StaffLake v-if="tab == 0" />
      <StaffOrder v-else-if="tab == 1" />
      <StaffLunch v-else-if="tab == 2" />
    </Transition>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'staff',
  middleware: 'staff'
})

const tab = ref(0)
const tabs = [
  { label: 'Hồ Câu', key: 'lake' },
  { label: 'Gọi Dịch Vụ', key: 'order' },
  { label: 'Đăng Ký Cơm', key: 'lunch' },
]
</script>