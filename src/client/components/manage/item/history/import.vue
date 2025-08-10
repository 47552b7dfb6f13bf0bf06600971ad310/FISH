<template>
  <div>
    <UiFlex class="mb-2 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]"/>

      <UForm :state="page" @submit="page.current = 1, getList()">
        <UiFlex class="gap-1">
          <UInput v-model="page.search.key" placeholder="Tìm kiếm theo tài khoản..." icon="i-bx-search" size="sm"/>
        </UiFlex>
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
          <UBadge color="gray" variant="soft">{{ row.user.name }}</UBadge>
        </template>

        <template #category-data="{ row }">
          <UBadge color="primary" variant="soft">{{ row.category ? row.category.name || '...' : '...' }}</UBadge>
        </template>

        <template #item-data="{ row }">
          {{ row.item ? row.item.name || '...' : '...' }}
        </template>

        <template #amount-data="{ row }">
          <UiText color="green">+ {{ useMoney().toMoney(row.amount || 0) }}</UiText>
        </template>

        <template #price-data="{ row }">
          {{ useMoney().toMoney(row.price || 0) }}
        </template>

        <template #note-data="{ row }">
          {{ row.note || '...' }}
        </template>

        <template #action-data="{ row }">
          <div class="whitespace-normal" v-html="row.action" />
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().displayFull(row.createdAt) }}
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between" class="mt-2">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>
  </div>
</template>

<script setup>
const props = defineProps(['fetchId'])

// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'user',
    label: 'Thực hiện',
  },{
    key: 'category',
    label: 'Danh mục',
  },{
    key: 'item',
    label: 'Sản phẩm',
  },{
    key: 'amount',
    label: 'Số lượng',
    sortable: true,
  },{
    key: 'price',
    label: 'Đơn giá 1 SP',
    sortable: true,
  },{
    key: 'note',
    label: 'Ghi chú',
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
  search: {
    key: null,
    by: 'USER'
  },
  total: 0,
  item: props.fetchId
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search.key, (val) => !val && getList())

// Loading
const loading = ref({
  load: true
})

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('item/manage/history/imp', JSON.parse(JSON.stringify(page.value)))

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
