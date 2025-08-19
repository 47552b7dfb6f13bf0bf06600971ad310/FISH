<template>
  <div>
    <UiFlex class="gap-1" wrap>
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]"/>

      <UForm :state="page" @submit="page.current = 1, getList()">
        <UiFlex class="gap-1">
          <UInput v-model="page.search.key" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
          <USelectMenu v-model="page.search.by" :options="['CODE', 'USER']" />
        </UiFlex>
      </UForm>
    </UiFlex>
    
    <!-- Table -->
    <UCard class="my-2" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <LoadingTable v-if="loading.load" />

      <UTable 
        v-model:sort="page.sort"
        :columns="selectedColumns" 
        :rows="list"
      >
        <template #code-data="{ row }">
          <UBadge variant="soft" class="cursor-pointer" color="primary" @click="selectTicket(row)">{{ row.code }}</UBadge>
        </template>

        <template #area-data="{ row }">
          {{ row.area ? row.area.name || '...' : '...' }} - {{ row.spot ? row.spot.code || '...' : '...' }}
        </template>

        <template #shift-data="{ row }">
          {{ row.shift ? row.shift.duration + 'h' : '...' }}
        </template>

        <template #user-data="{ row }">
          {{ row.user ? row.user.phone : '...' }}
        </template>

        <template #[`price.total-data`]="{ row }">
          {{ useMoney().toMoney(row.price ? row.price.total : 0) }}
        </template>

        <template #time-data="{ row }">
          <UiText v-if="row.time" :color="statusTicket[row.status]['color']">
            <UiCountdown :time="row.time.pay" v-if="row.status == 0"></UiCountdown>
            <UiCountdown :time="row.time.end" v-if="row.status == 2"></UiCountdown>
            <UiCountdown :time="row.time.delay" v-if="row.status == 3"></UiCountdown>
            <span v-if="row.status == 4">Kết thúc</span>
          </UiText>
        </template>

        <template #status-data="{ row }">
          <UBadge variant="soft" :color="statusTicket[row.status]['color']">{{ statusTicket[row.status]['label'] }}</UBadge>
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().displayFull(row.createdAt) }}
        </template>

        <template #actions-data="{ row }">
          <UiFlex class="gap-1">
            <UDropdown :items="actions(row)">
              <UButton color="gray" icon="i-bx-dots-horizontal-rounded" />
            </UDropdown>
          </UiFlex>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>

    <!-- Model View Ticket -->
    <UModal v-model="modal">
      <StaffTicket :ticket="stateView" @close="modal = false" type="ticket" />
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(['fetchId'])

// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'code',
    label: 'Mã',
  },{
    key: 'area',
    label: 'Khu vực'
  },{
    key: 'user',
    label: 'Khách hàng'
  },{
    key: 'shift',
    label: 'Ca'
  },{
    key: 'price.total',
    label: 'Thanh toán',
    sortable: true
  },{
    key: 'time',
    label: 'Đếm ngược'
  },{
    key: 'status',
    label: 'Trạng thái',
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
    by: 'CODE'
  },
  total: 0,
  area: props.fetchId
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search.key, (val) => !val && getList())

const statusTicket = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã thanh toán', color: 'primary' },
  2: { label: 'Đang Câu', color: 'green' },
  3: { label: 'Sắp kết thúc', color: 'purple' },
  4: { label: 'Kết thúc', color: 'red' },
}

// State
const stateView = ref()


// Modal
const modal = ref(false)

// Loading
const loading = ref({
  load: true
})

// Select Ticket
const selectTicket = (ticket) => {
  stateView.value = ticket
  modal.value = true
}

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('lake/manage/area/ticket', JSON.parse(JSON.stringify(page.value)))

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
