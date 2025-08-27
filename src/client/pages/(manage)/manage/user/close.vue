<template>
  <UiContent title="Giao Ca" sub="Quản lý giao ca của nhân viên">
    <UiFlex class="mb-4 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
      <UForm :state="page" @submit="page.current = 1, getList()">
        <UiFlex class="gap-1">
          <UInput v-model="page.search" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
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
          {{ row.user ? row.user.name || '...' : '...' }}
        </template>

        <template #[`time.start-data`]="{ row }">
          {{ !!row.time ? useDayJs().displayFull(row.time.start) : '...' }}
        </template>

        <template #[`time.end-data`]="{ row }">
          {{ !!row.time ? useDayJs().displayFull(row.time.end) : '...' }}
        </template>

        <template #stock-data="{ row }">
          <UButton size="xs" color="gray" @click="viewShift(row._id)">Xem chi tiết</UButton>
        </template>

        <template #cashInDrawer-data="{ row }">
          <UiText color="orange">{{ useMoney().toMoney(row.cashInDrawer) }}</UiText> 
        </template>

        <template #cashReported-data="{ row }">
          <UiText color="green">{{ useMoney().toMoney(row.cashReported) }}</UiText> 
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between" class="py-4">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>

    <!-- Modal View -->
    <UModal v-model="modal.view" prevent-close :ui="{width: 'sm:max-w-[800px]'}">
      <UiContent title="Chi Tiết" sub="Thông tin kho giao ca" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" color="gray" class="ml-auto" size="2xs" square @click="modal.view = false"></UButton>
        </template>

        <ManageUserCloseView :fetch-id="stateView" />
      </UiContent>
    </UModal>
  </UiContent>
</template>

<script setup>
// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'user',
    label: 'Nhân viên',
  },{
    key: 'time.start',
    label: 'Vào ca'
  },{
    key: 'time.end',
    label: 'Hết ca'
  },{
    key: 'stock',
    label: 'Kho',
  },{
    key: 'cashInDrawer',
    label: 'Tiền mặt vào ca'
  },{
    key: 'cashReported',
    label: 'Tiền mặt hết ca',
  }
]
const selectedColumns = ref([...columns])

// Page
const page = ref({
  size: 10,
  current: 1,
  sort: {
    column: 'time.end',
    direction: 'desc'
  },
  search: null,
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search, (val) => !val && getList())

// State
const stateView = ref()

// Modal
const modal = ref({
  view: false,
})

// Loading
const loading = ref({
  load: true
})

const viewShift = (_id) => {
  stateView.value = _id
  modal.value.view = true
}
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('user/manage/close/list', JSON.parse(JSON.stringify(page.value)))

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
