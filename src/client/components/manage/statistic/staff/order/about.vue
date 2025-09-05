<template>
  <UCard class="my-2" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
    <LoadingTable v-if="loading" />

    <UTable 
      :columns="selectedColumns" 
      :rows="list"
    >
      <template #amount-data="{ row }">
        <UiText color="yellow" weight="bold">{{ useMoney().toMoney(row.amount) }}</UiText> 
      </template>

      <template #money-data="{ row }">
        <UiText color="gray" weight="bold">{{ useMoney().toMoney(row.money) }}</UiText> 
      </template>

      <template #bank-data="{ row }">
        <UiText color="gray" weight="bold">{{ useMoney().toMoney(row.bank) }}</UiText> 
      </template>

      <template #total-data="{ row }">
        <UiText color="primary" weight="bold">{{ useMoney().toMoney(row.total) }}</UiText> 
      </template>
    </UTable>
  </UCard>
</template>

<script setup>
const props = defineProps(['staff', 'type', 'range', 'update'])
const loading = ref(true)
const list = ref([])

const columns = [
  {
    key: 'name',
    label: 'Sản phẩm',
  },{
    key: 'amount',
    label: 'Số lượng',
    sortable: true
  },{
    key: 'money',
    label: 'Tiền mặt',
    sortable: true
  },{
    key: 'bank',
    label: 'Chuyển khoản',
    sortable: true
  },{
    key: 'total',
    label: 'Tổng',
    sortable: true
  }
]
const selectedColumns = ref([...columns])
watch(() => props.update, () => getAbout())

// Fetch
const getAbout = async () => {
  try {
    loading.value = true
    const data = await useAPI('statistic/staff/order/about', JSON.parse(JSON.stringify({
      type: props.type,
      staff: props.staff,
      range: props.range
    })))

    loading.value = false
    list.value = data
  }
  catch (e) {
    loading.value = false
  } 
}

getAbout()
</script>