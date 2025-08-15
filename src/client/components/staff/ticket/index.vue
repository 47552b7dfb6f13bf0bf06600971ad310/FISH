<template>
  <DataEmpty text="Không có thông tin" class="bg-card p-4 rounded-2xl min-h-[300px]" :loading="loading" v-if="!!loading || !(!!select.area && !!select.spot && !!select.ticket)" />

  <UiContent :title="`${select.area.name} - ${select.spot.code}`" color="yellow" sub="Thông tin chi tiết vé câu" class="bg-card p-4 rounded-2xl" v-else>
    <template #more>
      <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="emits('close')"></UButton>
    </template>

    <UTabs v-model="tab" :items="tabItems"></UTabs>

    <StaffTicketInfo :area="select.area" :spot="select.spot" :ticket="select.ticket" @reload="init" @change="onChangeSpot" v-if="tab == 0" />
    <StaffTicketPay :area="select.area" :spot="select.spot" :ticket="select.ticket" @reload="init" v-if="tab == 1" />
    <StaffTicketOrder :area="select.area" :spot="select.spot" :ticket="select.ticket" v-if="tab == 2" />
    <StaffTicketFish :area="select.area" :spot="select.spot" :ticket="select.ticket" v-if="tab == 3" />
  </UiContent>
</template>

<script setup>
const props = defineProps(['spot', 'ticket', 'type'])
const emits = defineEmits(['close', 'changeSpot'])

const loading = ref(true)
const tab = ref(0) 
const tabItems = [
  { label: 'Thông tin' },
  { label: 'Thanh toán' },
  { label: 'Dịch vụ' },
  { label: 'Cá Câu' },
]

const select = ref({
  area: null,
  spot: null,
  ticket: null
})

const onChangeSpot = () => {
  if(props.type == 'ticket') return
  emits('changeSpot')
}

const selectSpot = async () => {
  try {
    loading.value = true
    const data = await useAPI('lake/staff/spot/get', { _id: props.spot?._id })
    
    select.value.area = data.area
    select.value.spot = data.spot
    select.value.ticket = data.ticket
    tab.value = 0
    loading.value = false
  }
  catch(e){
    loading.value = false
    select.value.area = null
    select.value.spot = null
    select.value.ticket = null
  }
}

const selectTicket = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/get', { code: props.ticket?.code })
    
    select.value.area = data.area
    select.value.spot = data.spot
    select.value.ticket = data.ticket
    tab.value = 0
    loading.value = false
  }
  catch(e){
    loading.value = false
    select.value.area = null
    select.value.spot = null
    select.value.ticket = null
  }
}

const init = () => {
  if(props.type == 'spot') return selectSpot()
  if(props.type == 'ticket') return selectTicket()
}

onMounted(() => setTimeout(() => init(), 1))
</script>