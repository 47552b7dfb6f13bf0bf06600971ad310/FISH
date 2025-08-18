<template>
  <UiContent title="Thời Gian Câu" sub="Quản lý các ca câu cài sẵn">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]" />
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

        <template #name-data="{ row }">
          <UiText weight="semibold" color="yellow">{{ row.name }}</UiText>
        </template>

        <template #duration-data="{ row }">
          {{ row.duration }}h
        </template>

        <template #price-data="{ row }">
          {{ useMoney().toMoney(row.price) }} VNĐ
        </template>

        <template #display-data="{ row }">
          <UBadge :color="row.display ? 'green' : 'gray'" variant="soft">{{ row.display ? 'Hiện' : 'Ẩn' }}</UBadge>
        </template>

        <template #isNight-data="{ row }">
          <UBadge :color="row.isNight ? 'green' : 'gray'" variant="soft">{{ row.isNight ? 'Có' : 'Không' }}</UBadge>
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
        
        <UFormGroup label="Tên ca">
          <UInput v-model="stateAdd.name" />
        </UFormGroup>

        <UFormGroup label="Thời gian">
          <UInput v-model="stateAdd.duration" type="number" />
        </UFormGroup>

        <UFormGroup label="Giá bán">
          <UInput v-model="stateAdd.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Là ca đêm">
          <USelectMenu v-model="stateAdd.isNight" size="lg" value-attribute="value" :options="[
            { label: 'Hiện', value: true },
            { label: 'Ẩn', value: false }
          ]">
            <template #label>
              <span v-if="stateAdd.isNight === undefined">Chọn loại</span>
              <span v-else>{{ stateAdd.isNight ? 'Có' : 'Không' }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup label="Hiển thị">
          <USelectMenu v-model="stateAdd.display" size="lg" value-attribute="value" :options="[
            { label: 'Hiện', value: true },
            { label: 'Ẩn', value: false }
          ]">
            <template #label>
              <span v-if="stateAdd.display === undefined">Chọn loại</span>
              <span v-else>{{ stateAdd.display ? 'Có' : 'Không' }}</span>
            </template>
          </USelectMenu>
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
        <UFormGroup label="Tên ca">
          <UInput v-model="stateEdit.name" />
        </UFormGroup>

        <UFormGroup label="Thời gian">
          <UInput v-model="stateEdit.duration" type="number" />
        </UFormGroup>

        <UFormGroup label="Giá bán">
          <UInput v-model="stateEdit.price" type="number" />
        </UFormGroup>

        <UFormGroup label="Là ca đêm">
          <USelectMenu v-model="stateEdit.isNight" size="lg" value-attribute="value" :options="[
            { label: 'Hiện', value: true },
            { label: 'Ẩn', value: false }
          ]">
            <template #label>
              <span v-if="stateEdit.isNight === undefined">Chọn loại</span>
              <span v-else>{{ stateEdit.isNight ? 'Có' : 'Không' }}</span>
            </template>
          </USelectMenu>
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
    key: 'area',
    label: 'Khu vực',
  },{
    key: 'name',
    label: 'Tên ca',
  },{
    key: 'duration',
    label: 'Thời gian',
    sortable: true
  },{
    key: 'price',
    label: 'Giá bán',
    sortable: true
  },{
    key: 'isNight',
    label: 'Ca đêm',
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
    column: 'count',
    direction: 'desc'
  },
  total: 0,
  area: null
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.area, () => getList())

// State
const stateAdd = ref({
  area: null,
  name: null,
  duration: null,
  price: null,
  isNight: false,
  display: true
})
const stateEdit = ref({
  _id: null,
  name: null,
  duration: null,
  price: null,
  isNight: null,
  display: null
})

// Modal
const modal = ref({
  add: false,
  edit: false
})

watch(() => modal.value.add, (val) => !val && (stateAdd.value = {
  area: null,
  name: null,
  duration: null,
  price: null,
  isNight: false,
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
    label: 'Xóa dữ liệu',
    icon: 'i-bx-trash',
    click: () => delAction(row._id)
  }]
]
 
// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('config/manage/shift/list', JSON.parse(JSON.stringify(page.value)))

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
    await useAPI('config/manage/shift/add', JSON.parse(JSON.stringify(stateAdd.value)))

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
    await useAPI('config/manage/shift/edit', JSON.parse(JSON.stringify(stateEdit.value)))

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
    await useAPI('config/manage/shift/del', { _id })

    loading.value.del = false
    getList()
  }
  catch (e) {
    loading.value.del = false
  }
}

getList()
</script>
