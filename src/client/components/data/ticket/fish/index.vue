<template>
  <div class="bg-gray-1000 rounded-2xl">
    <DataEmpty class="min-h-[300px]" text="Bạn chưa câu được con nào" :loading="loading" v-if="!!loading || list.length == 0" />
    
    <div v-else>
      <UTable :columns="selectedColumns" :rows="list">
        <template #category-data="{ row }">
          <UiText weight="semibold">{{ row.category ? row.category.name || '...' : '...' }}</UiText>
        </template>

        <template #amount-data="{ row }">
          <UiText color="green">{{ useMoney().toMoney(row.amount || 0) }} con</UiText>
        </template>

        <template #kg-data="{ row }">
          <UiText color="primary">{{ useMoney().toMoney(row.kg || 0) }} kg</UiText>
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().fromTime(row.createdAt) }}
        </template>
      </UTable>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['ticket'])

const list = ref([])
const loading = ref(true)

const columns = [
  {
    key: 'category',
    label: 'Loại',
  },{
    key: 'amount',
    label: 'Lượng'
  },{
    key: 'kg',
    label: 'Nặng'
  },{
    key: 'createdAt',
    label: 'T.Gian'
  }
]
const selectedColumns = ref([...columns])

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/public/fish/list', { code: props.ticket.code })

    list.value = data
    loading.value = false
  }
  catch (e) {
    loading.value = false
  } 
}

onMounted(() => setTimeout(() => getList(), 1))
</script>