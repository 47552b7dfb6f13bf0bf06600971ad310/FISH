<template>
  <UiContent title="Số Liệu Nhân Viên" sub="Thống kê các số liệu của nhân viên">
    <ManageStatisticStaff class="mb-4"/>
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