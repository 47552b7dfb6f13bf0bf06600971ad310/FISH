<template>
  <UiContent title="Voucher History" sub="Lịch sử dùng thẻ quà tặng quả thành viên">
    <UiFlex class="mb-4 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]"/>

      <UForm :state="page" @submit="page.current = 1, getList()">
        <UInput v-model="page.search" placeholder="Tìm kiếm tên tài khoản" icon="i-bx-search" size="sm"/>
      </UForm>
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
         {{ row.user ? row.user.phone || '...' : '...' }}
        </template>

        <template #ticket-data="{ row }">
         {{ row.ticket ? row.ticket.code || '...' : '...' }}
        </template>

        <template #voucher-data="{ row }">
          <span v-if="!row.voucher">...</span>
          <UiText v-else :color="row.voucher.type == 'DISCOUNT' ? 'rose' : row.voucher.type == 'DISCOUNT-COIN' ? 'orange' : 'green'">{{ row.voucher.title }}</UiText>
        </template>

        <template #content-data="{ row }">
          <div class="whitespace-normal" v-html="row.content" />
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
// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'ticket',
    label: 'Vé câu',
  },{
    key: 'user',
    label: 'Tài khoản',
  },{
    key: 'voucher',
    label: 'Thẻ quà tặng',
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
  search: null,
  total: 0,
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search, (val) => !val && getList())


// Loading
const loading = ref({
  load: true
})

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('voucher/manage/history', JSON.parse(JSON.stringify(page.value)))

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
