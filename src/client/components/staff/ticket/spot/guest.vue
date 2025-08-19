<template>
  <UForm :state="state">
    <UFormGroup label="Tên khách hàng">
      <UInput icon="i-bxs-user" v-model="state.name" />
    </UFormGroup>

    <UFormGroup label="Số điện thoại">
      <UInput icon="i-bxs-phone" v-model="state.phone" />
    </UFormGroup>

    <UFormGroup label="Chơi Heo không" v-if="!!area && !!area.pig && !!area.pig.max > 0">
      <USelectMenu v-model="state.pig" size="lg" value-attribute="value" :options="[
        { label: 'Có', value: true },
        { label: 'Không', value: false }
      ]">
        <template #label>
          <span v-if="state.pig === undefined">Lựa chọn</span>
          <span v-else>{{ state.pig ? 'Có' : 'Không' }}</span>
        </template>
      </USelectMenu>
    </UFormGroup>
    
    <UFormGroup label="Phương thức thanh toán">
      <SelectPayType v-model="state.pay_type" />
    </UFormGroup>

    <UFormGroup label="Thời gian vào thực tế">
      <UInput v-model="state.start" type="time" />
    </UFormGroup>

    <UFormGroup>
      <DataTicketCreateShift :area="area" @select="selectShift" @close="emits('close')" />
    </UFormGroup>
  </UForm>
</template>

<script setup>
const props = defineProps(['spot'])
const emits = defineEmits(['close', 'done'])

const area = computed(() => {
  return props.spot ? props.spot.area : null
})

const loading = ref(false)
const reg = ref(false)

const state = ref({
  start: null,
  name: null,
  phone: undefined,
  area: area.value._id,
  spot: props.spot._id,
  shift: null,
  lunch: false,
  pig: true,
  pay_type: 'MONEY'
})

const randPhone = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = 8
  const code = Array.from({ length })
  .map(() => chars[Math.floor(Math.random() * chars.length)])
  .join('')
  return code
}

const selectShift = (data) => {
  if(!!loading.value) return 

  state.value.shift = data.shift ? data.shift._id : null,
  state.value.lunch = data.lunch

  if(!reg.value) return fastRegister()
  else addAction()
}

const fastRegister = async () => {
  try {
    loading.value = true
    const data = JSON.parse(JSON.stringify(state.value))
    await useAPI('user/public/sign/fast', {
      name: data.name,
      phone: data.phone
    })

    reg.value = true
    addAction()
  }
  catch(e){
    loading.value = false
  }
}

const addAction = async () => {
  try {
    loading.value = true
    const code = await useAPI('ticket/staff/create', JSON.parse(JSON.stringify(state.value)))

    emits('done')
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}

onMounted(() => {
  state.value.name = 'Vẵng Lai'
  state.value.phone = randPhone()
})
</script>