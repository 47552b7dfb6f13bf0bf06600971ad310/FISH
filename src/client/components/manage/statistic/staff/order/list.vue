<template>
  <div>
    <UiFlex class="gap-1" wrap="">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />

      <UForm :state="page" @submit="page.current = 1, getList()">
        <UiFlex class="gap-1">
          <UInput v-model="page.search.key" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
          <USelectMenu v-model="page.search.by" :options="['CODE', 'TICKET', 'USER']" />
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
          <UBadge variant="soft" class="cursor-pointer" color="purple" @click="selectTicket(row.ticket)" v-if="row.ticket">{{ row.ticket ? row.ticket.code : '...' }}</UBadge>
          <span v-else>...</span>
        </template>

        <template #user-data="{ row }">
          {{ row.user ? row.user.name : '...' }}
        </template>

        <template #cart-data="{ row }">
          {{ row.cart.length }}
        </template>

        <template #total-data="{ row }">
          <UiText color="yellow" weight="semibold">{{ useMoney().toMoney(row.total) }}</UiText> 
        </template>

        <template #[`pay.type-data`]="{ row }">
          {{ row.pay.type == 'BANK' ? 'Chuyển khoản' : 'Tiền Mặt' }}
        </template>

        <template #status-data="{ row }">
          <UBadge variant="soft" :color="statusOrder[row.status]['color']">{{ statusOrder[row.status]['label'] }}</UBadge>
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().fromTime(row.createdAt) }}
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

    <!-- Modal View Order -->
    <UModal v-model="modal.order">
      <StaffOrderView :code="order" @close="modal.order = false" />
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(['staff', 'type', 'range', 'update'])

// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'code',
    label: 'Mã đơn',
  },{
    key: 'ticket',
    label: 'Kèm vé',
  },{
    key: 'user',
    label: 'Khách',
  },{
    key: 'cart',
    label: 'Sản phẩm'
  },{
    key: 'total',
    label: 'Thanh toán'
  },{
    key: 'pay.type',
    label: 'Phương thức'
  },{
    key: 'status',
    label: 'Trạng thái',
    sortable: true
  },{
    key: 'createdAt',
    label: 'Thời gian đặt'
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
  staff: props.staff,
  type: props.type,
  range: props.range
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search.key, (val) => !val && getList())
watch(() => props.update, () => getList())

const statusOrder = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã Giao', color: 'green' },
  2: { label: 'Đã Hủy', color: 'red' },
}

// Loading
const loading = ref({
  load: true,
  action: false
})

const modal = ref({
  ticket: false,
  order: false
})

const ticket = ref()
const order = ref()

const selectTicket = (data) => {
  ticket.value = data
  modal.value.ticket = true
}

const selectOrder = (code) => {
  order.value = code
  modal.value.order = true
}

// Fetch
const getList = async () => {
  try {
    loading.value.load = true

    page.value.staff = props.staff
    page.value.type = props.type
    page.value.range = props.range

    const data = await useAPI('statistic/staff/order/list', JSON.parse(JSON.stringify(page.value)))

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
