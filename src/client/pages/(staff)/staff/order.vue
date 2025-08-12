<template>
  <UiContent title="Dịch Vụ Chưa Giao" sub="Danh sách các dịch vụ chưa xử lý">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
    </UiFlex>
    
    <!-- Table -->
    <UCard class="my-2" :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <LoadingTable v-if="loading.load" />

      <UTable 
        v-model:sort="page.sort"
        :columns="selectedColumns" 
        :rows="list"
      >
        <template #ticket-data="{ row }">
          <UBadge variant="soft" class="cursor-pointer" color="primary" @click="selectTicket(row.ticket)">{{ row.ticket ? row.ticket.code : '...' }}</UBadge>
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

    <UModal v-model="modal">
      <StaffTicket :ticket="select" @close="modal = false" type="ticket" />
    </UModal>
  </UiContent>
</template>

<script setup>
// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'ticket',
    label: 'Mã vé',
  },{
    key: 'code',
    label: 'Mã đơn',
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
    direction: 'asc'
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
  action: false
})

const modal = ref(false)

const select = ref()

const selectTicket = (ticket) => {
  select.value = ticket
  modal.value = true
}

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('item/staff/order/list', JSON.parse(JSON.stringify(page.value)))

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
