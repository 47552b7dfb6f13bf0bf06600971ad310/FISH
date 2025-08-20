<template>
  <UiContent title="Statistic" sub="Thống kê số liệu">
    <ManageStatisticFast class="mb-4"/>
  </UiContent>
</template>

<script setup>
const tab = ref(0)

const tabs = [
  { label: 'Nạp tiền', key: 'payment' },
  { label: 'Chi tiêu', key: 'spend' },
  { label: 'Đăng nhập', key: 'signin' },
  { label: 'Đăng ký', key: 'signup' },
]

const source = ref([])
</script>