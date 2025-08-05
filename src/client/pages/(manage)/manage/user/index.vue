<template>
  <UiContent title="Tài Khoản" sub="Quản lý tài khoản người dùng">
    <UiFlex class="gap-1">
      <USelectMenu v-model="page.size" :options="[5,10,20,50,100]"/>
      <UForm :state="page" @submit="page.current = 1, getList()">
        <UInput v-model="page.search" placeholder="Tìm kiếm..." icon="i-bx-search" size="sm" />
      </UForm>
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
          {{ row.name || '...' }}
        </template>

        <template #email-data="{ row }">
          {{ row.email || '...' }}
        </template>

        <template #type-data="{ row }">
          <UBadge :color="typeFormat[row.type].color" variant="soft">
            {{ typeFormat[row.type].label }}
          </UBadge>
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().displayFull(row.createdAt) }}
        </template>

        <template #actions-data="{ row }">
          <UiFlex class="gap-1">
            <UDropdown :items="actions(row)">
              <UButton color="gray" icon="i-bx-dots-horizontal-rounded" />
            </UDropdown>
          </UiFlex>
        </template>
      </UTable>
    </UCard>

    <!-- Pagination -->
    <UiFlex justify="between">
      <USelectMenu v-model="selectedColumns" :options="columns" multiple placeholder="Chọn cột" />
      <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
    </UiFlex>

    <!-- Modal Edit Auth-->
    <UModal v-model="modal.editAuth" preventClose>
      <UForm :state="stateEditAuth" @submit="editAuthAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Mật khẩu">
          <UInput v-model="stateEditAuth.password" type="password" />
        </UFormGroup>

        <UFormGroup label="Quyền">
          <SelectUserType v-model="stateEditAuth.type" />
        </UFormGroup>

        <UiFlex justify="end"  class="gap-1">
          <UButton color="yellow" type="submit" :loading="loading.editAuth">Sửa</UButton>
          <UButton color="gray" @click="modal.editAuth = false" :disabled="loading.editAuth">Đóng</UButton>
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
    label: 'Tên',
  },{
    key: 'phone',
    label: 'SĐT'
  },{
    key: 'email',
    label: 'Email'
  },{
    key: 'type',
    label: 'Quyền',
    sortable: true
  },{
    key: 'createdAt',
    label: 'Ngày tạo',
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
  search: null,
  total: 0
})
watch(() => page.value.size, () => getList())
watch(() => page.value.current, () => getList())
watch(() => page.value.sort.column, () => getList())
watch(() => page.value.sort.direction, () => getList())
watch(() => page.value.search, (val) => !val && getList())

// State
const stateEditAuth = ref({
  _id: null,
  password: null,
  type: null
})

// Modal
const modal = ref({
  editAuth: false,
})

// Loading
const loading = ref({
  load: true,
  editAuth: false
})

// Type
const typeFormat = {
  0: { label: 'MEMBER', color: 'gray' },
  1: { label: 'STAFF', color: 'green' },
  2: { label: 'SMOD', color: 'cyan' },
  3: { label: 'ADMIN', color: 'red' }
}

// Actions
const actions = (row) => [
  [{
    label: 'Sửa thông tin',
    icon: 'i-bx-pencil',
    click: () => {
      Object.keys(stateEditAuth.value).forEach(key => stateEditAuth.value[key] = row[key])
      modal.value.editAuth = true
    }
  }]
]

// Fetch
const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('user/manage/list', JSON.parse(JSON.stringify(page.value)))

    loading.value.load = false
    list.value = data.list
    page.value.total = data.total
  }
  catch (e) {
    loading.value.load = false
  } 
}

const editAuthAction = async () => {
  try {
    loading.value.editAuth = true
    await useAPI('user/manage/edit', JSON.parse(JSON.stringify(stateEditAuth.value)))

    loading.value.editAuth = false
    modal.value.editAuth = false
    getList()
  }
  catch (e) {
    loading.value.editAuth = false
  }
}

getList()
</script>
