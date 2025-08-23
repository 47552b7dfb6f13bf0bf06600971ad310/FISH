<template>
  <UiContent title="Vòng Quay Tuần" sub="Quản lý vòng quay may mắn tuần">
    <UiFlex class="mb-4 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" class="mr-auto"/>
      <UButton color="yellow" @click="modal.add = true">Thêm mới</UButton>
      <UButton color="green" @click="navigateTo('/manage/wheel/history')">Lịch sử</UButton>
    </UiFlex>
    
    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
      <LoadingTable v-if="loading.load" />

      <UTable 
        v-model:sort="page.sort"
        :columns="selectedColumns" 
        :rows="list"
      > 
        <template #type-data="{ row }">
          <UBadge variant="soft" :color="row.type == 0 ? 'rose' : row.type == 1 ? 'primary' : 'green'">{{ typeFormat[row.type]['label'] }}</UBadge>
        </template>

        <template #amount-data="{ row }">{{ toMoney(row.amount) }}</template>

        <template #percent-data="{ row }">{{ row.percent }}%</template>

        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" icon="i-bx-dots-horizontal-rounded" :disabled="loading.del"/>
          </UDropdown>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between" class="py-4">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>

    <!-- Modal Add -->
    <UModal v-model="modal.add" preventClose>
      <UForm :state="stateAdd" @submit="addAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Loại quà">
          <SelectWheelType v-model="stateAdd.type" />
        </UFormGroup>

        <UFormGroup label="Chọn thẻ Voucher" v-if="stateAdd.type == 2">
          <SelectVoucherManage v-model="stateAdd.voucher" />
        </UFormGroup>

        <UFormGroup label="Tên quà">
          <UInput v-model="stateAdd.name" />
        </UFormGroup>

        <UFormGroup label="Tổng giải">
          <UInput v-model="stateAdd.amount" type="number" />
        </UFormGroup>

        <UFormGroup label="Tỷ lệ">
          <UInput v-model="stateAdd.percent" type="number" />
        </UFormGroup>

        <UiFlex justify="end" class="mt-6">
          <UButton type="submit" :loading="loading.add">Thêm</UButton>
          <UButton color="gray" @click="modal.add = false" :disabled="loading.add" class="ml-1">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal Edit -->
    <UModal v-model="modal.edit" preventClose>
      <UForm :state="stateEdit" @submit="editAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Tên quà">
          <UInput v-model="stateEdit.name" />
        </UFormGroup>

        <UFormGroup label="Tổng giải">
          <UInput v-model="stateEdit.amount" type="number" />
        </UFormGroup>

        <UFormGroup label="Tỷ lệ">
          <UInput v-model="stateEdit.percent" type="number" />
        </UFormGroup>

        <UiFlex justify="end" class="mt-6">
          <UButton type="submit" :loading="loading.edit">Sửa</UButton>
          <UButton color="gray" @click="modal.edit = false" :disabled="loading.edit" class="ml-1">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>
  </UiContent>
</template>

<script setup>
const { toMoney } = useMoney()
// List
const list = ref([])

// Columns
const columns = [
  {
    key: 'type',
    label: 'Loại',
  },{
    key: 'name',
    label: 'Tên quà',
  },{
    key: 'amount',
    label: 'Tổng giải',
    sortable: true
  },{
    key: 'percent',
    label: 'Tỷ lệ',
    sortable: true
  },{
    key: 'actions',
    label: 'Chức năng',
  }
]
const selectedColumns = ref([...columns])

// Page
const page = ref({
  size: 10,
  current: 1,
  sort: {
    column: 'percent',
    direction: 'desc'
  },
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())

// State
const stateAdd = ref({
  type: 1,
  voucher: null,
  name: null,
  amount: null,
  percent: null,
})
const stateEdit = ref({
  _id: null,
  name: null,
  amount: null,
  percent: null
})

// Modal
const modal = ref({
  add: false,
  edit: false
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  type: 1,
  voucher: null,
  name: null,
  amount: null,
  percent: null,
}))

// Loading
const loading = ref({
  load: true,
  add: false,
  edit: false,
  del: false
})

const typeFormat = {
  0: { label: 'Mất lượt' },
  1: { label: 'Vật phẩm' },
  2: { label: 'Voucher' },
}

// Actions
const actions = (row) => [
  [{
    label: 'Sửa thông tin',
    icon: 'i-bx-pencil',
    click: () => {
      Object.keys(stateEdit.value).forEach(key => stateEdit.value[key] = row[key])
      modal.value.edit = true
    }
  }],[{
    label: 'Xóa vật phẩm',
    icon: 'i-bx-trash',
    click: () => delAction(row._id)
  }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('wheel/manage/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('wheel/manage/add', JSON.parse(JSON.stringify(stateAdd.value)))

    loading.value.add = false
    modal.value.add = false
    getList()
  }
  catch (e) {
    loading.value.add = false
  }
}

const editAction = async () => {
  try {
    loading.value.edit = true
    await useAPI('wheel/manage/edit', JSON.parse(JSON.stringify(stateEdit.value)))

    loading.value.edit = false
    modal.value.edit = false
    getList()
  }
  catch (e) {
    loading.value.edit = false
  }
}

const delAction = async (_id) => {
  try {
    loading.value.del = true
    await useAPI('wheel/manage/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
