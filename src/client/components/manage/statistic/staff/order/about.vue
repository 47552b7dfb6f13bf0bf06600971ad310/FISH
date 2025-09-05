<template>
  <UCard class="my-2" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
    <LoadingTable v-if="loading" />

    <UTable 
      :columns="selectedColumns" 
      :rows="list"
    >
      <template #totalAmount-data="{ row }">
        <UiText color="green" weight="bold">{{ useMoney().toMoney(row.totalAmount) }}</UiText> 
      </template>

      <template #totalMoney-data="{ row }">
        <UiText color="yellow" weight="bold">{{ useMoney().toMoney(row.totalMoney) }}</UiText> 
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
    key: 'totalAmount',
    label: 'Số lượng bán',
    sortable: true
  },{
    key: 'totalMoney',
    label: 'Tổng tiền bán',
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