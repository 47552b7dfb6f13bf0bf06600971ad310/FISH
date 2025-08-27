<template>
  <UTable :columns="selectedColumns" :rows="list">
    <template #item-data="{ row }">
      <UiText weight="semibold" color="yellow">{{ row.item ? row.item.name : '...' }}</UiText>
    </template>

    <template #previous-data="{ row }">
      <UiText color="primary">{{ useMoney().toMoney(row.previous) }}</UiText>
    </template>

    <template #current-data="{ row }">
      <UiText color="orange">{{ useMoney().toMoney(row.current) }}</UiText>
    </template>

    <template #diff-data="{ row }">
      <UiText :color="row.diff == 0 ? 'gray' : row.diff > 0 ? 'green' : 'rose'">
        <UiIcon class="mr-1" :name="row.diff == 0 ? '' : row.diff > 0 ? 'i-fa6-solid-up-long' : 'i-fa6-solid-arrow-down'"></UiIcon>
        {{ useMoney().toMoney(row.diff) }}
      </UiText>
    </template>

    <template #sold-data="{ row }">
      <UiText color="red">{{ useMoney().toMoney(row.sold) }}</UiText>
    </template>
  </UTable>
</template>

<script setup>
const props = defineProps(['fetchId'])

const loading = ref(true)
const list = ref([])

const columns = [
  {
    key: 'item',
    label: 'Sản phẩm',
  },{
    key: 'previous',
    label: 'Bàn giao ca trước'
  },{
    key: 'current',
    label: 'Bàn giao ca này'
  },{
    key: 'diff',
    label: 'Chênh lệch',
  },{
    key: 'sold',
    label: 'Đã bán trong ca',
  }
]
const selectedColumns = ref([...columns])

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('user/manage/close/view', {
      _id: props.fetchId
    })
    
    list.value = data
    loading.value = true
  }
  catch(e){
    loading.value = false
  }
}

onMounted(() => setTimeout(getList, 1))
</script>