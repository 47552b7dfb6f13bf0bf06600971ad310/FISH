<template>
  <UiContent title="Lịch Sử Quay" sub="Lịch sử vòng quay may mắn">
    <UiFlex class="mb-4 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />

      <UForm :state="page" @submit="page.current = 1, getList()">
        <UInput v-model="page.search.key" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
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
          <UBadge color="gray">{{ row.user.phone }}</UBadge>
        </template>

        <template #type-data="{ row }">
          <UBadge variant="soft" :color="row.type == 0 ? 'rose' : row.type == 1 ? 'primary' : 'green'">{{ typeFormat[row.type]['label'] }}</UBadge>
        </template>

        <template #amount-data="{ row }">{{ toMoney(row.amount) }}</template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().displayFull(row.createdAt) }}
        </template>

        <template #received-data="{ row }">
          <span v-if="row.type == 0">...</span>
          <div v-else>
            <UBadge size="xs" color="green" variant="soft" v-if="!!row.received">Đã trao</UBadge>
            <UButton size="xs" v-else color="gray" :disabled="loading.action" @click="action(row._id)">Trao quà</UButton>
          </div>
          
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
    key: 'user',
    label: 'Tài khoản',
  },{
    key: 'type',
    label: 'Loại',
  },{
    key: 'name',
    label: 'Tên quà',
  },{
    key: 'createdAt',
    label: 'Thời gian',
    sortable: true
  },{
    key: 'received',
    label: 'Trao quà',
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
  },
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search.key, (val) => !val && getList())

// Loading
const loading = ref({
  load: true,
  action: false
})

const typeFormat = {
  0: { label: 'Mất lượt' },
  1: { label: 'Vật phẩm' },
  2: { label: 'Voucher' },
}

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('wheel/manage/history', JSON.parse(JSON.stringify(page.value)))

    loading.value.load = false
    list.value = data.list
    page.value.total = data.total
  }
  catch (e) {
    loading.value.load = false
  } 
}

// Action
const action = async (_id) => {
  try {
    loading.value.action = true
    const data = await useAPI('wheel/manage/action', {
      _id: _id
    })

    loading.value.action = false
    getList()
  }
  catch (e) {
    loading.value.load = false
  } 
}

getList()
</script>
