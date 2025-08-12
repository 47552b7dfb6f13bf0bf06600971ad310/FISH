<template>
  <UiContent title="Danh sách" sub="Quản lý các lần nhập cá">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
      <SelectLakeArea v-model="page.area" size="sm" />
      <SelectFishCategory v-model="page.category" size="sm" class="mr-auto" />
      <UButton color="yellow" icon="i-bx-plus" @click="modal.add = true">Nhập thêm</UButton>
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
          <UBadge color="primary" variant="soft">{{ row.area ? row.area.name : '...' }}</UBadge>
        </template>

        <template #category-data="{ row }">
          <UBadge color="yellow" variant="soft">{{ row.category ? row.category.name : '...' }}</UBadge>
        </template>

        <template #amount-data="{ row }">
          {{ useMoney().toMoney(row.amount) }} Con
        </template>

        <template #kg-data="{ row }">
          {{ useMoney().toMoney(row.kg) }} Kg
        </template>

        <template #price-data="{ row }">
          {{ useMoney().toMoney(row.price) }} / Kg
        </template>

        <template #time-data="{ row }">
          {{ useDayJs().displayFull(row.time) }}
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>

    <!-- Modal Add -->
    <UModal v-model="modal.add" preventClose>
      <UForm :state="stateAdd" @submit="addAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Khu vực">
          <SelectLakeArea v-model="stateAdd.area" />
        </UFormGroup>

        <UFormGroup label="Loại cá">
          <SelectFishCategory v-model="stateAdd.category" />
        </UFormGroup>

        <UFormGroup label="Số lượng">
          <UInput v-model="stateAdd.amount" type="number" />
        </UFormGroup>

        <UFormGroup label="Tổng khối lượng">
          <UInput v-model="stateAdd.kg" type="number" />
        </UFormGroup>

        <UFormGroup label="Đơn giá (1kg)">
          <UInput v-model="stateAdd.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Thời gian nhập">
          <SelectDate time v-model="stateAdd.time" placeholder="Chọn" />
        </UFormGroup>

        <UiFlex class="gap-1">
          <UiFlex justify="end" class="gap-2 mr-auto">
            <UToggle v-model="stateAdd.isPig" />
            <UiText color="gray" size="sm">Là Heo</UiText>
          </UiFlex>

          <UButton color="yellow" type="submit" :loading="loading.add">Nhập</UButton>
          <UButton color="gray" @click="modal.add = false" :disabled="loading.add">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>
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
    key: 'category',
    label: 'Loại cá',
  },{
    key: 'amount',
    label: 'Số lượng',
    sortable: true
  },{
    key: 'kg',
    label: 'Khối lượng',
    sortable: true
  },{
    key: 'price',
    label: 'Đơn giá',
    sortable: true
  },{
    key: 'time',
    label: 'Ngày nhập',
    sortable: true
  }
]
const selectedColumns = ref([...columns])

// Page
const page = ref({
  size: 10,
  current: 1,
  sort: {
    column: 'time',
    direction: 'desc'
  },
  total: 0,
  category: null,
  area: null
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.area, () => getList())
watch(() => page.value.category, () => getList())

// State
const stateAdd = ref({
  area: null,
  category: null,
  amount: null,
  kg: null,
  time: null,
  price: null,
  isPig: false
})

// Modal
const modal = ref({
  add: false,
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  area: null,
  category: null,
  amount: null,
  kg: null,
  time: null,
  price: null,
  isPig: false
}))

// Loading
const loading = ref({
  load: true,
  add: false,
})

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('fish/manage/list', JSON.parse(JSON.stringify(page.value)))

    loading.value.load = false
    list.value = data.list
    page.value.total = data.total
  }
  catch (e) {
    loading.value.load = false
  } 
}

const addAction = async () => {
  try {
    loading.value.add = true
    await useAPI('fish/manage/add', JSON.parse(JSON.stringify(stateAdd.value)))

    loading.value.add = false
    modal.value.add = false
    getList()
  }
  catch (e) {
    loading.value.add = false
  }
}

getList()
</script>
