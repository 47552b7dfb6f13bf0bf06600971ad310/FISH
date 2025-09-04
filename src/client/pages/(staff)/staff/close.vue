<template>
  <UiContent title="Giao Ca" sub="Nhân viên bàn giao ca">
    <UForm :state="state" @submit="submit" class="bg-gray-1000 rounded-2xl p-4">
      <UFormGroup label="Thời gian bắt đầu ca làm" class="grow">
        <UInput type="datetime-local" v-model="state.time.start" />
      </UFormGroup>

      <UiFlex class="gap-2">
        <UFormGroup label="Tiền lẻ cầm lúc nhận ca" class="grow">
          <UInput type="number" v-model="state.cashInDrawer"  />
        </UFormGroup>

        <UFormGroup label="Tiền mặt bàn giao ca" class="grow">
          <UInput type="number" v-model="state.cashReported"  />
        </UFormGroup>
      </UiFlex>

      <UFormGroup label="Ghi chú">
        <UTextarea autoresize v-model="state.note" name="input" />
      </UFormGroup>

      <UFormGroup label="Bàn giao đồ dịch vụ">
        <DataEmpty text="Không có sản phầm nào" class="min-h-[200px]" :loading="loading.item" v-if="!!loading.item || list.length == 0"></DataEmpty>
        <div class="grid grid-cols-12 gap-2">
          <UiFlex class="col-span-6 md:col-span-4 bg-gray rounded-2xl p-4 md:p-2 gap-2 md:gap-4 flex-col md:flex-row" v-for="item in list" :key="item._id">
            <UiImg :src="item.image" w="1" h="1" class="bg-gray-1000 rounded-xl max-w-[80px]"/>
            <div>
              <UiText weight="semibold" color="yellow" class="text-sm md:text-base text-center md:text-start line-clamp-1 mb-2">{{ item.name }}</UiText>
              <UInput v-model="stock[item._id]" placeholder="Số lượng" type="number" size="sm" />
            </div>
          </UiFlex>
        </div>
      </UFormGroup>

      <UiFlex justify="end" class="gap-1">
        <UButton color="yellow" type="submit" :loading="loading.submit">Xác Nhận</UButton>
        <UButton color="gray" :disabled="!!loading.submit" @click="emits('close')">Đóng</UButton>
      </UiFlex>
    </UForm>
  </UiContent>
</template>

<script setup>
const emits = defineEmits(['close'])

const loading = ref({
  submit: false,
  item: true
})

const state = ref({
  time: {
    start: null
  },

  stock: [],

  cashInDrawer: null,
  cashReported: null,

  note: null
})

const list = ref([])
const stock = computed(() => {
  const data = {}
  list.value.forEach(item => {
    data[item._id] = 0
  })
  return data
})

const getItem = async () => {
  try {
    loading.value.item = true
    const data = await useAPI('item/staff/list', {})

    loading.value.item = false
    list.value = data
  }
  catch (e) {
    loading.value.item = false
  } 
}

const submit = async () => {
  try {
    loading.value.submit = true

    state.value.stock = Object.entries(stock.value).map(([key, value]) => ({
      item: key,
      quantity: value
    }))
    await useAPI('user/staff/close', JSON.parse(JSON.stringify(state.value)))

    loading.value.submit = false
    emits('close')
  }
  catch (e) {
    loading.value.submit = false
  }
}

onMounted(() => setTimeout(getItem, 1))
</script>