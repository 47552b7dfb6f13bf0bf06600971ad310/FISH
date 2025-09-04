<template>
  <div>
    <UiFlex class="mb-2">
      <UTabs v-model="tab" :items="tabs"></UTabs>
    </UiFlex>

    <NuxtPage />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'staff',
  middleware: 'staff'
})

const route = useRoute()
const tabRoute = {
  '/staff': 0,
  '/staff/order': 1,
  '/staff/lunch': 2,
  '/staff/connect': 3,
  '/staff/close': 4,
}
const tab = ref(tabRoute[route.fullPath])
const tabs = [
  { label: 'Hồ Câu', key: '/staff' },
  { label: 'Gọi Dịch Vụ', key: '/staff/order' },
  { label: 'Đăng Ký Cơm', key: '/staff/lunch' },
  { label: 'Đơn Nối Ca', key: '/staff/connect' },
  { label: 'Giao Ca', key: '/staff/close' },
]

watch(tab, (val) => navigateTo(tabs[val]['key']))
</script>