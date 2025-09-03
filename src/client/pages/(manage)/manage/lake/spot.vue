<template>
  <UiContent title="Ô Câu" sub="Quản lý các ô câu cho thuê">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
      <UForm :state="page" @submit="page.current = 1, getList()">
        <UInput v-model="page.search" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
      </UForm>
      <SelectLakeArea v-model="page.area" size="sm" class="mr-auto" />
      <UButton color="yellow" icon="i-bx-plus" @click="modal.add = true">Thêm mới</UButton>
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

        <template #status-data="{ row }">
          <UBadge :color="row.status == 0  ? 'gray' : 'green'" variant="soft">
            {{ row.status == 0 ? 'Đang trống' : 'Đang sử dụng' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="actions(row)">
            <UButton color="gray" icon="i-bx-dots-horizontal-rounded" :disabled="loading.del"/>
          </UDropdown>
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

        <UFormGroup label="Số ô">
          <UInput v-model="stateAdd.code" type="number" />
        </UFormGroup>

        <UiFlex justify="end" class="gap-1">
          <UButton color="yellow" type="submit" :loading="loading.add">Thêm</UButton>
          <UButton color="gray" @click="modal.add = false" :disabled="loading.add">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal Edit -->
    <UModal v-model="modal.edit" preventClose>
      <UForm :state="stateEdit" @submit="editAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Số ô">
          <UInput v-model="stateEdit.code" type="number" />
        </UFormGroup>

        <UiFlex justify="end" class="gap-1">
          <UButton color="yellow" type="submit" :loading="loading.edit">Sửa</UButton>
          <UButton color="gray" @click="modal.edit = false" :disabled="loading.edit">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal History -->
    <UModal v-model="modal.history" preventClose :ui="{width: 'sm:max-w-[800px]'}">
      <UiContent title="Lịch Sử Vé" sub="Các vé câu trên ô này" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.history = false"></UButton>
        </template>

        <ManageLakeSpotTicket :fetch-id="stateHistory" />
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
    key: 'area',
    label: 'Khu vực',
  },{
    key: 'code',
    label: 'Ô số',
    sortable: true
  },{
    key: 'status',
    label: 'Trạng thái',
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
    column: 'createdAt',
    direction: 'desc'
  },
  total: 0,
  area: null,
  search: null
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.area, () => getList())
watch(() => page.value.search, (val) => (!val && getList()))

// State
const stateAdd = ref({
  area: null,
  code: null,
})
const stateEdit = ref({
  _id: null,
  code: null,
})
const stateHistory = ref()

// Modal
const modal = ref({
  add: false,
  edit: false,
  history: false
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  area: null,
  code: null,
}))

// Loading
const loading = ref({
  load: true,
  add: false,
  edit: false
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
  }],
  [{
    label: 'Lịch sử vé',
    icon: 'i-bx-time',
    click: () => {
      stateHistory.value = row._id
      modal.value.history = true
    }
  }],
  // [{
  //   label: 'Xóa tin tức',
  //   icon: 'i-bx-trash',
  //   click: () => delAction(row._id)
  // }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('lake/manage/spot/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('lake/manage/spot/add', JSON.parse(JSON.stringify(stateAdd.value)))

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
    await useAPI('lake/manage/spot/edit', JSON.parse(JSON.stringify(stateEdit.value)))

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
    await useAPI('lake/manage/spot/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
