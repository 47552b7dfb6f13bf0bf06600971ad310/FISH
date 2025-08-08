<template>
  <div>
    <UiFlex justify="end" class="mb-2">
      <UButton icon="i-bx-plus" color="yellow" @click="modal = true">Thêm</UButton>
    </UiFlex>

    <DataEmpty class="min-h-[300px]" text="Chưa câu được con nào" :loading="loading.list" v-if="!!loading.list || list.length == 0" />
    
    <div class="bg-gray-1000 rounded-2xl" v-else>
      <UTable v-model:sort="page.sort" :columns="selectedColumns" :rows="list">
        <template #category-data="{ row }">
          <UiText weight="semibold">{{ row.category ? row.category.name || '...' : '...' }}</UiText>
        </template>

        <template #amount-data="{ row }">
          <UiText color="green">{{ useMoney().toMoney(row.amount || 0) }}</UiText>
        </template>

        <template #kg-data="{ row }">
          <UiText color="primary">{{ useMoney().toMoney(row.kg || 0) }}</UiText>
        </template>

        <template #createdAt-data="{ row }">
          {{ useDayJs().fromTime(row.createdAt) }}
        </template>
      </UTable>
    </div>

    <UModal v-model="modal" preventClose>
      <UForm :state="stateAdd" @submit="addAction" class="bg-card rounded-2xl p-4">
        <UFormGroup label="Loại cá">
          <SelectFishCategory v-model="stateAdd.category" />
        </UFormGroup>

        <UFormGroup label="Cân nặng ước tính">
          <UInput v-model="stateAdd.kg" type="number" />
        </UFormGroup>

        <UFormGroup label="Link Livestream">
          <UInput v-model="stateAdd.proof.live" />
        </UFormGroup>

        <UFormGroup label="Hình ảnh (nếu có)">
          <UiUploadImage v-model="stateAdd.proof.image">
            <template #default="{ select, loading }">
              <UInput :model-value="stateAdd.proof.image" :loading="loading" readonly @click="select"/>
            </template>
          </UiUploadImage>
        </UFormGroup>

        <UiFlex justify="end">
          <UButton color="yellow" type="submit" :loading="loading.add">Xác Nhận</UButton>
          <UButton color="gray" @click="modal = false" :disabled="loading.add" class="ml-1">Đóng</UButton>
        </UiFlex>
      </UForm>
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])

const list = ref([])
const loading = ref({
  list: true,
  add: false
})
const modal = ref(false)

const columns = [
  {
    key: 'category',
    label: 'Loại',
  },{
    key: 'amount',
    label: 'Số con',
    sortable: true,
  },{
    key: 'kg',
    label: 'Nặng',
    sortable: true,
  },{
    key: 'createdAt',
    label: 'T.Gian',
    sortable: true
  }
]
const selectedColumns = ref([...columns])

const page = ref({
  sort: {
    column: 'createdAt',
    direction: 'desc'
  }
})
const stateAdd = ref({
  ticket: props.ticket.code,
  category: null,
  kg: null,
  proof: {
    live: null,
    image: null
  }
})

const getList = async () => {
  try {
    loading.value.list = true
    const data = await useAPI('ticket/staff/fish/list', { code: props.ticket.code })

    list.value = data
    loading.value.list = false
  }
  catch (e) {
    loading.value.list = false
  } 
}

const addAction = async () => {
  try {
    loading.value.add = true
    await useAPI('ticket/staff/fish/add', JSON.parse(JSON.stringify(stateAdd.value)))

    loading.value.add = false
    modal.value = false
    getList()
  }
  catch (e) {
    loading.value.add = false
  } 
}

onMounted(() => setTimeout(() => getList(), 1))
</script>