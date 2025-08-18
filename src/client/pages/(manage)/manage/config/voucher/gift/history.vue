<template>
  <UiContent title="Lịch Sử Tặng Voucher" sub="Lịch sử những lần trạng Voucher">
    <UiFlex class="mb-4 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
    </UiFlex>
    
    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <LoadingTable v-if="loading.load" />

      <UTable 
        v-model:sort="page.sort"
        :columns="selectedColumns" 
        :rows="list"
      > 
        <template #user-data="{ row }">
          <UBadge color="gray">{{ row.user ? row.user.phone : '...' }}</UBadge>
        </template>

        <template #staff-data="{ row }">
          <UBadge color="gray">{{ row.staff ? row.staff.phone : '...' }}</UBadge>
        </template>

        <template #voucher-data="{ row }">
          {{ row.voucher ? row.voucher.title : '...' }}
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().displayFull(row.createdAt) }}
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between" class="py-4">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>
  </UiContent>
</template>

<script setup>
const { toMoney } = useMoney()
// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'staff',
    label: 'Người gửi',
  },{
    key: 'user',
    label: 'Người nhận',
  },{
    key: 'voucher',
    label: 'Tên thẻ',
  },{
    key: 'createdAt',
    label: 'Thời gian',
    sortable: true
  }
]
const selectedColumns = ref([...columns])

// Page
const page = ref({
  size: 10,
  current: 1,
  sort: {
    column: 'createdAt',
    direction: 'desc'
  },
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())

// Loading
const loading = ref({
  load: true,
})

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('user/manage/add/voucher/history', JSON.parse(JSON.stringify(page.value)))

    loading.value.load = false
    list.value = data.list
    page.value.total = data.total
  }
  catch (e) {
    loading.value.load = false
  } 
}

getList()
</script>
