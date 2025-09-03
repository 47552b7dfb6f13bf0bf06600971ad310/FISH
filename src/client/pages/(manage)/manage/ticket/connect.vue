<template>
  <UiContent title="Đơn Nối Ca" sub="Quản lý danh sách các đơn nối ca câu">
    <UiFlex class="gap-1" wrap>
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]"/>

      <UForm :state="page" @submit="page.current = 1, getList()">
        <UiFlex class="gap-1">
          <UInput v-model="page.search.key" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
          <USelectMenu v-model="page.search.by" :options="['CODE', 'TICKET', 'USER', 'STAFF']" />
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
          <UBadge variant="soft" class="cursor-pointer" color="primary" @click="selectOrder(row.code)">{{ row.code }}</UBadge>
        </template>

        <template #ticket-data="{ row }">
          <UBadge variant="soft" class="cursor-pointer" color="primary" @click="selectTicket(row.ticket)" v-if="row.ticket">{{ row.ticket ? row.ticket.code : '...' }}</UBadge>
          <span v-else>...</span>
        </template>

        <template #user-data="{ row }">
          {{ row.user ? row.user.name : '...' }}
        </template>

        <template #staff-data="{ row }">
          {{ row.staff ? row.staff.name : '...' }}
        </template>

        <template #old-data="{ row }">
          {{ row.old ? row.old.duration+'h' : '...' }}
        </template>

        <template #new-data="{ row }">
          {{ row.new ? row.new.duration+'h' : '...' }}
        </template>

        <template #[`pay.type-data`]="{ row }">
          {{ row.pay.type == 'BANK' ? 'Chuyển khoản' : 'Tiền Mặt' }}
        </template>

        <template #total-data="{ row }">
          <UiText color="yellow" weight="semibold">{{ useMoney().toMoney(row.total) }}</UiText> 
        </template>

        <template #status-data="{ row }">
          <UBadge variant="soft" :color="statusConnect[row.status]['color']">{{ statusConnect[row.status]['label'] }}</UBadge>
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().displayFull(row.createdAt) }}
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>

    <!-- Modal View Ticket -->
    <UModal v-model="modal.ticket">
      <StaffTicket :ticket="ticket" @close="modal.ticket = false" type="ticket"/>
    </UModal>
  </UiContent>
</template>

<script setup>
// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'code',
    label: 'Mã',
  },{
    key: 'ticket',
    label: 'Kèm vé'
  },{
    key: 'user',
    label: 'Người tạo'
  },{
    key: 'old',
    label: 'Ca cũ'
  },{
    key: 'new',
    label: 'Ca mới'
  },{
    key: 'pay.type',
    label: 'Phương thức'
  },{
    key: 'total',
    label: 'Thanh toán',
    sortable: true
  },{
    key: 'status',
    label: 'Trạng thái',
    sortable: true
  },{
    key: 'staff',
    label: 'Nhân viên'
  },{
    key: 'createdAt',
    label: 'Ngày tạo',
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
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search.key, (val) => !val && getList())

const statusConnect = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Hoàn Thành', color: 'green' },
  2: { label: 'Đã Huỷ', color: 'red' }
}

// State
const ticket = ref()

// Modal
const modal = ref({
  ticket: false
})

// Loading
const loading = ref({
  load: true
})

const selectTicket = (data) => {
  ticket.value = data
  modal.value.ticket = true
}

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('ticket/manage/connect', JSON.parse(JSON.stringify(page.value)))

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
