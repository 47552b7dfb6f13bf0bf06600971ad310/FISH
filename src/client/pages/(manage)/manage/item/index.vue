<template>
  <UiContent title="Sản Phẩm" sub="Quản lý các sản phẩm bày bán">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
      <SelectItemCategory v-model="page.category" size="sm" class="mr-auto" />
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
        <template #category-data="{ row }">
          <UBadge color="primary" variant="soft">{{ row.category ? row.category.name : '...' }}</UBadge>
        </template>

        <template #price-data="{ row }">
          {{ useMoney().toMoney(row.price) }} VNĐ
        </template>

        <template #inventory-data="{ row }">
          {{ useMoney().toMoney(row.inventory) }}
        </template>

        <template #display-data="{ row }">
          <UBadge :color="row.display ? 'green' : 'gray'" variant="soft">{{ row.display ? 'Hiện' : 'Ẩn' }}</UBadge>
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
        <UFormGroup label="Loại">
          <SelectItemCategory v-model="stateAdd.category" />
        </UFormGroup>

        <UFormGroup label="Tên">
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

        <UFormGroup label="Giá bán">
          <UInput v-model="stateAdd.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Hiển thị">
          <USelectMenu v-model="stateAdd.display" size="lg" value-attribute="value" :options="[
            { label: 'Hiện', value: true },
            { label: 'Ẩn', value: false }
          ]">
            <template #label>
              <span v-if="stateAdd.display === undefined">Chọn loại</span>
              <span v-else>{{ stateAdd.display ? 'Hiện' : 'Ẩn' }}</span>
            </template>
          </USelectMenu>
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
        <UFormGroup label="Tên">
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

        <UFormGroup label="Giá bán">
          <UInput v-model="stateEdit.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Hiển thị">
          <USelectMenu v-model="stateEdit.display" size="lg" value-attribute="value" :options="[
            { label: 'Hiện', value: true },
            { label: 'Ẩn', value: false }
          ]">
            <template #label>
              <span v-if="stateEdit.display === undefined">Chọn loại</span>
              <span v-else>{{ stateEdit.display ? 'Hiện' : 'Ẩn' }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UiFlex justify="end" class="gap-1">
          <UButton color="yellow" type="submit" :loading="loading.edit">Sửa</UButton>
          <UButton color="gray" @click="modal.edit = false" :disabled="loading.edit">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal Import -->
    <UModal v-model="modal.import" preventClose>
      <UForm :state="stateImport" @submit="importAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Sản phẩm">
          <UInput :model-value="stateImport.name" readonly />
        </UFormGroup>

        <UFormGroup label="Số lượng">
          <UInput v-model="stateImport.data.amount" type="number" />
        </UFormGroup>

        <UFormGroup label="Đơn giá 1 sản phẩm">
          <UInput v-model="stateImport.data.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Ghi chú (nếu có)">
          <UTextarea v-model="stateImport.data.note" autoresize />
        </UFormGroup>

        <UiFlex justify="end" class="gap-1">
          <UButton color="yellow" type="submit" :loading="loading.import">Xác Nhận</UButton>
          <UButton color="gray" @click="modal.import = false" :disabled="loading.import">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>

    <!-- Modal History -->
    <UModal v-model="modal.history" preventClose :ui="{width: 'sm:max-w-[1200px]'}">
      <UiContent title="Lịch Sử" sub="Lịch sử nhập xuất kho của sản phẩm" class="bg-card rounded-2xl p-4">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.history = false"></UButton>
        </template>

        <ManageItemHistory :fetch-id="stateHistory._id"/>

        <UiFlex class="mt-4 gap-1" justify="end">
          <UButton color="gray" @click="modal.history = false">Đóng</UButton>
        </UiFlex>
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
    key: 'category',
    label: 'Loại',
  },{
    key: 'name',
    label: 'Sản phẩm',
  },{
    key: 'price',
    label: 'Giá bán',
    sortable: true
  },{
    key: 'inventory',
    label: 'Tồn kho',
    sortable: true
  },{
    key: 'display',
    label: 'Hiển thị',
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
  category: null
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.category, () => getList())

// State
const stateAdd = ref({
  category: null,
  name: null,
  key: null,
  description: null,
  image: null,
  price: null,
  display: true
})
const stateEdit = ref({
  _id: null,
  name: null,
  key: null,
  description: null,
  image: null,
  price: null,
  display: true
})
const stateImport = ref({
  _id: null,
  name: null,
  data: {
    amount: null,
    price: null,
    note: null,
  }
})
const stateHistory = ref({
  _id: null
})

// Modal
const modal = ref({
  add: false,
  edit: false,
  import: false,
  history: false
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  category: null,
  name: null,
  key: null,
  description: null,
  image: null,
  price: null,
  display: true
}))

// Loading
const loading = ref({
  load: true,
  add: false,
  edit: false,
  import: false,
  export: false
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
    label: 'Nhập kho',
    icon: 'i-bx-plus',
    click: () => {
      stateImport.value._id = row._id
      stateImport.value.name = row.name
      stateImport.value.data.amount = null
      stateImport.value.data.price = null
      stateImport.value.data.note = null
      modal.value.import = true
    }
  }],[{
    label: 'Lịch sử',
    icon: 'i-ix-import',
    click: () => {
      stateHistory.value._id = row._id
      modal.value.history = true
    }
  }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('item/manage/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('item/manage/add', JSON.parse(JSON.stringify(stateAdd.value)))

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
    await useAPI('item/manage/edit', JSON.parse(JSON.stringify(stateEdit.value)))

    loading.value.edit = false
    modal.value.edit = false
    getList()
  }
  catch (e) {
    loading.value.edit = false
  }
}

const importAction = async () => {
  try {
    loading.value.import = true
    await useAPI('item/manage/imp', JSON.parse(JSON.stringify(stateImport.value)))

    loading.value.import = false
    modal.value.import = false
    getList()
  }
  catch (e) {
    loading.value.import = false
  }
}

const delAction = async (_id) => {
  try {
    loading.value.del = true
    await useAPI('item/manage/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
