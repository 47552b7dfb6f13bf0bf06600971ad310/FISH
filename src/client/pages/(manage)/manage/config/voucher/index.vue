<template>
  <UiContent title="Voucher" sub="Quản lý các phiếu quà tặng">
    <UiFlex class="mb-4 gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" class="mr-auto"/>
      <UButton color="primary" @click="navigateTo('/manage/config/voucher/gift')">Tặng Voucher</UButton>
      <UButton color="yellow" @click="modal.add = true">Thêm Mới</UButton>
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
          <UiText :color="row.type == 'DISCOUNT' ? 'rose' : row.type == 'DISCOUNT-COIN' ? 'orange' : 'green'">{{ row.title }}</UiText>
        </template>

        <template #expired-data="{ row }">
          <UBadge :color="!!row.expired ? 'orange' : 'gray'" variant="soft">
            {{ !!row.expired ? useDayJs().displayFull(row.expired) : 'Không' }}
          </UBadge>
        </template>

        <template #display-data="{ row }">
          <UBadge :color="!!row.display ? 'green' : 'gray'" variant="soft">{{ !!row.display ? 'Hiện' : 'Ẩn' }}</UBadge>
        </template>

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
        <UFormGroup label="Loại phiếu">
          <USelectMenu size="lg" v-model="stateAdd.type" :options=" [
            { label: 'Giảm giá %', value: 'DISCOUNT' },
          ]" value-attribute="value" />
        </UFormGroup>

        <UFormGroup label="Tên phiếu">
          <UInput v-model="stateAdd.title" />
        </UFormGroup>

        <UFormGroup label="Giá trị phiếu">
          <UInput v-model="stateAdd.value" type="number" />
        </UFormGroup>

        <UFormGroup label="Giới hạn người dùng">
          <UInput v-model="stateAdd.limit" type="number" />
        </UFormGroup>

        <UFormGroup label="Thời gian hết hạn">
          <SelectDate v-model="stateAdd.expired" time placeholder="..." />
        </UFormGroup>

        <UiFlex class="mt-4 gap-1" justify="end">
          <UButton type="submit" :loading="loading.add">Thêm</UButton>
          <UButton color="gray" @click="modal.add = false" :disabled="loading.add">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal Edit -->
    <UModal v-model="modal.edit" preventClose>
      <UForm :state="stateEdit" @submit="editAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Loại phiếu">
          <USelectMenu size="lg" v-model="stateEdit.type" :options=" [
            { label: 'Giảm giá %', value: 'DISCOUNT' }
          ]" value-attribute="value" />
        </UFormGroup>

        <UFormGroup label="Tên phiếu">
          <UInput v-model="stateEdit.title" />
        </UFormGroup>

        <UFormGroup label="Giá trị phiếu">
          <UInput v-model="stateEdit.value" type="number" />
        </UFormGroup>

        <UFormGroup label="Giới hạn người dùng">
          <UInput v-model="stateEdit.limit" type="number" />
        </UFormGroup>

        <UFormGroup label="Thời gian hết hạn">
          <SelectDate v-model="stateEdit.expired" time placeholder="..." />
        </UFormGroup>

        <UiFlex class="mt-4 gap-1" justify="end">
          <UButton type="submit" :loading="loading.edit">Thêm</UButton>
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
    label: 'Tên thẻ',
    sortable: true
  },{
    key: 'value',
    label: 'Giá trị',
    sortable: true
  },{
    key: 'expired',
    label: 'Hết hạn',
    sortable: true
  },{
    key: 'limit',
    label: 'Giới hạn',
    sortable: true
  },{
    key: 'display',
    label: 'Hiển thị',
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
    column: 'value',
    direction: 'asc'
  },
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())

// State
const stateAdd = ref({
  type: 'DISCOUNT',
  title: null,
  expired: null,
  value: null,
  limit: 0,
  display: true
})
watch(() => stateAdd.value.type, (val) => (stateAdd.value.need = null))

const stateEdit = ref({
  _id: null,
  type: null,
  title: null,
  expired: null,
  value: null,
  limit: null,
  display: null
})

// Modal
const modal = ref({
  add: false,
  edit: false,
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  type: 'DISCOUNT',
  title: null,
  expired: null,
  value: 0,
  limit: null,
  display: true
}))

// Loading
const loading = ref({
  load: true,
  add: false,
  edit: false,
  del: false
})


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
    label: 'Xóa thẻ',
    icon: 'i-bx-trash',
    click: () => delAction(row._id)
  }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('voucher/manage/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('voucher/manage/add', JSON.parse(JSON.stringify(stateAdd.value)))

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
    await useAPI('voucher/manage/edit', JSON.parse(JSON.stringify(stateEdit.value)))

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
    await useAPI('voucher/manage/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
