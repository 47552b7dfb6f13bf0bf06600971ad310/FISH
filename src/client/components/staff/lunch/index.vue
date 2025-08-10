<template>
  <UiContent title="Cơm Chưa Giao" sub="Danh sách các vé đăng ký cơm chưa xử lý">
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
        <template #area-data="{ row }">
          <UiText color="yellow">{{ row.area ? row.area.name : '...' }}</UiText>
        </template>
        
        <template #spot-data="{ row }">
          <UiText color="yellow">{{ row.spot ? row.spot.code : '...' }}</UiText>
        </template>

        <template #status-data="{ row }">
          <UBadge 
            v-if="row.status < 3" 
            variant="soft" 
            :color="statusTicket[row.status]['color']"
          >
            {{ statusTicket[row.status]['label'] }}
          </UBadge>
        </template>

        <template #action-data="{ row }">
          <UiFlex class="gap-1">
            <UButton size="xs" icon="i-bx-check" color="gray" :disabled="!!loading.action" @click="successAction(row.code)">Đã Giao</UButton>
          </UiFlex>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between">
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
    key: 'area',
    label: 'Khu vực',
  },{
    key: 'spot',
    label: 'Ô câu',
  },{
    key: 'status',
    label: 'Trạng thái vé'
  },{
    key: 'action',
    label: 'Chức năng'
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

const statusTicket = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã thanh toán', color: 'primary' },
  2: { label: 'Đang Câu', color: 'green' },
  3: { label: 'Sắp kết thúc', color: 'purple' },
  4: { label: 'Kết thúc', color: 'end' },
}

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('ticket/staff/lunch/list', JSON.parse(JSON.stringify(page.value)))

    loading.value.load = false
    list.value = data.list
    page.value.total = data.total
  }
  catch (e) {
    loading.value.load = false
  } 
}

const successAction = async (code) => {
  try {
    loading.value.action = true
    await useAPI('ticket/staff/lunch/action', {
      code: code
    })

    loading.value.action = false
    getList()
  }
  catch (e) {
    loading.value.action = false
  }
}

getList()
</script>
