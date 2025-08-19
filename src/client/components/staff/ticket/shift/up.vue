<template>
  <div v-if="!!ticket">
    <DataEmpty text="Không có dữ liệu" class="min-h-[300px]" :loading="loading.list" v-if="!!loading.list"/>

    <div v-else>
      <div v-if="!!connect">
        <StaffTicketShiftPay :connect="connect" :ticket="ticket" @done="emits('done')" @cancel="emits('close')"/>
      </div>

      <div v-else>
        <DataEmpty text="Không có giờ câu nào khả dụng để nối thêm" class="min-h-[300px]" v-if="options.length == 0"/>

        <div v-else>
          <URadioGroup v-model="selected" :options="options">
            <template #label="{ option }">
              {{ option.label }}
            </template>

            <template #help="{ option }">
              <UiText class="mt-2 mb-4">{{ useMoney().toMoney(option.price - shift.price) }} VNĐ</UiText>
            </template>
          </URadioGroup>

          <SelectPayType v-model="pay_type" class="mb-2" />

          <UiFlex class="gap-1">
            <UButton color="yellow" class="grow justify-center" :loading="loading.action" @click="onAction">Xác Nhận</UButton>
            <UButton color="gray" class="grow justify-center" :disabled="!!loading.action" @click="emits('close')">Hủy</UButton>
          </UiFlex>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['ticket'])
const emits = defineEmits(['close', 'done'])

const list = ref([])
const connect = ref()

const loading = ref({
  list: true,
  action: false
})

const selected = ref()
const pay_type = ref()

const options = computed(() => {
  return list.value.map(i => {
    return {
      value: i._id,
      label: i.name,
      price: i.price
    }
  })
})

const shift = computed(() => {
  return !!props.ticket ? props.ticket.shift : null 
})

const onAction = async () => {
  try {
    loading.value.action = true
    await useAPI('ticket/staff/shift/up/create', { 
      ticket: props.ticket.code,
      shift: selected.value,
      pay_type: pay_type.value
    })
    
    get()
    loading.value.action = false
  }
  catch (e) {
    loading.value.action = false
  }
}

const get = async () => {
  try {
    loading.value.list = true
    list.value = []
    connect.value = null

    const data = await useAPI('ticket/staff/shift/up/get', { 
      ticket: props.ticket.code
    })
    
    if(data.list) list.value = data.list
    if(data.connect) connect.value = data.connect
    loading.value.list = false
  }
  catch (e) {
    loading.value.list = false
  }
}
onMounted(() => setTimeout(() => get(), 1))
</script>