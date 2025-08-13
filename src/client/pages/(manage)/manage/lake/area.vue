<template>
  <UiContent title="Khu Vực" sub="Quản lý các khu vực câu">
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
        <template #name-data="{ row }">
          <UiText weight="semibold" color="primary">{{ row.name }}</UiText>
        </template>

        <template #[`pig.money-data`]="{ row }">
          {{ useMoney().toMoney(row.pig.money || 0) }}
        </template>

        <template #[`pig.percent-data`]="{ row }">
          {{ useMoney().toMoney(row.pig.percent || 0) }}%
        </template>

        <template #[`future.price-data`]="{ row }">
          {{ row.future ? useMoney().toMoney(row.future.price) : '0' }} VNĐ /Kg
        </template>

        <template #[`future.percent-data`]="{ row }">
          {{ row.future ? useMoney().toMoney(row.future.percent) : '0' }}% doanh thu
        </template>

        <template #description-data="{ row }">
          {{ row.description || '...' }}
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
        <UFormGroup label="Tên khu vực">
          <UInput v-model="stateAdd.name" />
        </UFormGroup>

        <UFormGroup label="Mô tả">
          <UTextarea v-model="stateAdd.description" autoresize />
        </UFormGroup>

        <UFormGroup label="Hình ảnh">
          <UiUploadImage v-model="stateAdd.image">
            <template #default="{ select, loading }">
              <UInput :model-value="stateAdd.image" :loading="loading" readonly @click="select"/>
            </template>
          </UiUploadImage>
        </UFormGroup>

        <UFormGroup label="Giá bồi tương lai (? VNĐ / 1 Kg)">
          <UInput v-model="stateAdd.future.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Bồi thêm bằng bao % doanh thu">
          <UInput v-model="stateAdd.future.percent" type="number" />
        </UFormGroup>

        <UFormGroup label="Hũ heo hiện tại">
          <UInput v-model="stateAdd.pig.money" type="number" />
        </UFormGroup>

        <UFormGroup label="Mua vé chia % cho hũ heo">
          <UInput v-model="stateAdd.pig.percent" type="number" />
        </UFormGroup>

        <UFormGroup label="Số tiền tối đa thêm vào hũ mỗi vé">
          <UInput v-model="stateAdd.pig.max" type="number" />
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
        <UFormGroup label="Tên khu vực">
          <UInput v-model="stateEdit.name" />
        </UFormGroup>

        <UFormGroup label="Mô tả">
          <UTextarea v-model="stateEdit.description" autoresize />
        </UFormGroup>

        <UFormGroup label="Hình ảnh">
          <UiUploadImage v-model="stateEdit.image">
            <template #default="{ select, loading }">
              <UInput :model-value="stateEdit.image" :loading="loading" readonly @click="select"/>
            </template>
          </UiUploadImage>
        </UFormGroup>

        <UFormGroup label="Giá bồi tương lai (? VNĐ / 1 Kg)">
          <UInput v-model="stateEdit.future.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Bồi thêm bằng bao % doanh thu">
          <UInput v-model="stateEdit.future.percent" type="number" />
        </UFormGroup>

        <UFormGroup label="Hũ heo hiện tại">
          <UInput v-model="stateEdit.pig.money" type="number" />
        </UFormGroup>

        <UFormGroup label="Mua vé chia % cho hũ heo">
          <UInput v-model="stateEdit.pig.percent" type="number" />
        </UFormGroup>

        <UFormGroup label="Số tiền tối đa thêm vào hũ mỗi vé">
          <UInput v-model="stateEdit.pig.max" type="number" />
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
    key: 'name',
    label: 'Tên khu vực',
  },{
    key: 'description',
    label: 'Mô tả',
  },{
    key: 'pig.money',
    label: 'Hũ heo',
  },{
    key: 'pig.percent',
    label: 'Chia hũ heo',
  },{
    key: 'future.price',
    label: 'Giá bồi tương lai',
  },{
    key: 'future.percent',
    label: 'Bồi theo doanh thu',
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
    column: 'count',
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
  name: null,
  description: null,
  image: null,
  future: {
    price: null,
    percent: null
  },
  pig: {
    money: 0,
    percent: 0,
    max: 0
  }
})
const stateEdit = ref({
  _id: null,
  name: null,
  description: null,
  image: null,
  future: {
    price: null,
    percent: null
  },
  pig: {
    money: null,
    percent: null,
    max: null
  }
})

// Modal
const modal = ref({
  add: false,
  edit: false
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  name: null,
  description: null,
  image: null,
  future: {
    price: null,
    percent: null
  },
  pig: {
    money: 0,
    percent: 0,
    max: 30000
  }
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
      stateEdit.value._id = row._id
      stateEdit.value.name = row.name || ''
      stateEdit.value.description = row.description || ''
      stateEdit.value.image = row.image || ''
      stateEdit.value.future.price = !!row.future ? row.future.price || 0 : 0
      stateEdit.value.future.percent = !!row.future ? row.future.percent || 10 : 10
      stateEdit.value.pig.money = !!row.pig ? row.pig.money || 0 : 0
      stateEdit.value.pig.percent = !!row.pig ? row.pig.percent || 0 : 0
      stateEdit.value.pig.max = !!row.pig ? row.pig.max || 0 : 0
      modal.value.edit = true
    }
  }],[{
    label: 'Xóa dữ liệu',
    icon: 'i-bx-trash',
    click: () => delAction(row._id)
  }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('lake/manage/area/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('lake/manage/area/add', JSON.parse(JSON.stringify(stateAdd.value)))

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
    await useAPI('lake/manage/area/edit', JSON.parse(JSON.stringify(stateEdit.value)))

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
    await useAPI('lake/manage/area/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
