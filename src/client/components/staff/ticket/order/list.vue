<template>
  <div class="bg-gray-1000 rounded-2xl">
    <UTable :columns="selectedColumns" :rows="list">
      <template #cart-data="{ row }">
        {{ row.cart.length }}
      </template>

      <template #status-data="{ row }">
        <UBadge variant="soft" :color="statusOrder[row.status]['color']">{{ statusOrder[row.status]['label'] }}</UBadge>
      </template>

      <template #createdAt-data="{ row }">
        {{ useDayJs().fromTime(row.createdAt) }}
      </template>
    </UTable>
  </div>
</template>

<script setup>
const props = defineProps(['list', 'ticket'])

// Columns
const columns = [
  {
    key: 'code',
    label: 'Mã đơn',
  },{
    key: 'cart',
    label: 'Sản phẩm'
  },{
    key: 'status',
    label: 'Thanh toán'
  },{
    key: 'createdAt',
    label: 'Thời gian'
  }
]
const selectedColumns = ref([...columns])

const statusOrder = {
  0: { label: 'Chưa giao', color: 'orange' },
  1: { label: 'Đã giao', color: 'green' },
  2: { label: 'Đã hủy', color: 'rose' },
}
</script>
