<template>
  <UiContent title="Chi Tiêu" sub="Quản lý các chi tiêu của hồ">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" class="mr-auto"/>
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
        <template #title-data="{ row }">
          <UiText class="whitespace-normal">{{ row.title }}</UiText>
        </template>

        <template #money-data="{ row }">
          <UiText weight="semibold">{{ useMoney().toMoney(row.money) }}</UiText>
        </template>

        <template #images-data="{ row }">
          <UiImgs v-if="row.images && row.images.length > 0" :src="row.images" />
          <span v-else>...</span>
        </template>

        <template #time-data="{ row }">
          {{ useDayJs().displayFull(row.time) }}
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
        <UFormGroup label="Tiêu đề">
          <UInput v-model="stateAdd.title" />
        </UFormGroup>

        <UFormGroup label="Số tiền">
          <UInput v-model="stateAdd.money" type="number" />
        </UFormGroup>

        <UFormGroup label="Thời gian">
          <SelectDate time v-model="stateAdd.time" />
        </UFormGroup>

        <UFormGroup label="Lý do">
          <UTextarea v-model="stateAdd.reason" autoresize />
        </UFormGroup>

        <UFormGroup label="Hình ảnh">
          <UiUploadImages v-model="stateAdd.images"></UiUploadImages>
        </UFormGroup>

        <UiFlex justify="end">
          <UButton color="yellow" type="submit" :loading="loading.add">Thêm</UButton>
          <UButton color="gray" @click="modal.add = false" :disabled="loading.add" class="ml-1">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal Edit -->
    <UModal v-model="modal.edit" preventClose>
      <UForm :state="stateEdit" @submit="editAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Tiêu đề">
          <UInput v-model="stateEdit.title" />
        </UFormGroup>

        <UFormGroup label="Số tiền">
          <UInput v-model="stateEdit.money" type="number" />
        </UFormGroup>

        <UFormGroup label="Thời gian">
          <SelectDate time v-model="stateEdit.time" />
        </UFormGroup>

        <UFormGroup label="Lý do">
          <UTextarea v-model="stateEdit.reason" autoresize />
        </UFormGroup>

        <UFormGroup label="Hình ảnh">
          <UiUploadImages v-model="stateEdit.images"></UiUploadImages>
        </UFormGroup>

        <UiFlex justify="end">
          <UButton color="yellow" type="submit" :loading="loading.edit">Sửa</UButton>
          <UButton color="gray" @click="modal.edit = false" :disabled="loading.edit" class="ml-1">Đóng</UButton>
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
    key: 'title',
    label: 'Tiêu đề',
  },{
    key: 'money',
    label: 'Số tiền',
    sortable: true
  },{
    key: 'reason',
    label: 'Lý do',
  },{
    key: 'images',
    label: 'Hình ảnh',
  },{
    key: 'time',
    label: 'Thời gian',
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
    column: 'time',
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
  title: null,
  money: null,
  reason: null,
  images: [],
  time: null
})
const stateEdit = ref({
  _id: null,
  title: null,
  money: null,
  reason: null,
  images: [],
  time: null
})

// Modal
const modal = ref({
  add: false,
  edit: false
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  category: null,
  title: null,
  description: null,
  og_image: null,
  pin: 0,
  display: 1
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
      stateEdit.value.images = JSON.parse(JSON.stringify(row.images))
      modal.value.edit = true
    }
  }],[{
    label: 'Xóa chi tiêu',
    icon: 'i-bx-trash',
    click: () => delAction(row._id)
  }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('spend/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('spend/add', JSON.parse(JSON.stringify(stateAdd.value)))

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
    await useAPI('spend/edit', JSON.parse(JSON.stringify(stateEdit.value)))

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
    await useAPI('spend/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
