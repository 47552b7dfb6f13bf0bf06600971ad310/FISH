<template>
  <div>
    <LoadingTable v-if="loading" />

    <UTable v-model:sort="page.sort" :columns="columns" :rows="list" class="BoxBlock rounded-xl">
      <template #user-data="{ row }">
        {{ row.user.name }}
      </template>

      <template #createdAt-data="{ row }">
        {{ useDayJs().displayFull(row.createdAt) }}
      </template>
    </UTable>

    <UiFlex justify="end" class="mt-4">
      <UPagination class="ml-auto" v-model="page.current" :page-count="page.size" :total="page.total" :max="5" />
    </UiFlex>
  </div>
</template>

<script setup>
const emits = defineEmits(['close'])
const loading = ref(false)

const list = ref([])

const columns = [
  {
    key: 'user',
    label: 'Tài khoản',
  },{
    key: 'name',
    label: 'Phần thưởng',
  },{
    key: 'createdAt',
    label: 'Thời gian'
  }
]

const page = ref({
  size: 5,
  current: 1,
  sort: {
    column: 'createdAt',
    direction: 'desc'
  },
  total: 0,
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('wheel/public/lucky', JSON.parse(JSON.stringify(page.value)))
    
    list.value = data.list
    page.value.total = data.total
    loading.value = false
  }
  catch (e) {
    loading.value = false
  } 
}

onMounted(() => setTimeout(getList, 1))
</script>