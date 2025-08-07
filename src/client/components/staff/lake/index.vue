<template>
  <div>
    <DataEmpty text="Không tìm thấy dữ liệu hồ" class="min-h-[300px]" :loading="loading" v-if="!!loading || lake.length == 0"></DataEmpty>
    
    <div class="grid grid-cols-12 gap-4" v-else>
      <div class="lg:col-span-6 col-span-12" v-for="area in lake" :key="area._id">
        <UiTitle :name="area.name" icon="i-mdi-fish" class="mb-3" />

        <UiFlex wrap class="gap-0.5 lg:justify-start justify-center">
          <UiFlex 
            v-for="spot in area.spots" :key="spot._id" 
            justify="center"
            :class="`bg-${statusFormat[spot.status]['color']}-500`" 
            class="p-4 w-[80px] h-[80px] font-semibold cursor-pointer text-xl rounded-lg"
            @click="selectSpot(spot.code)"
          >
            {{ spot.code }}
          </UiFlex>
        </UiFlex>
      </div>
    </div>

    <UModal v-model="modal">
      <UiContent :title="`${select.area.name} - ${select.spot.code}`" color="yellow" sub="Thông tin chi tiết vé câu" class="bg-card p-4 rounded-2xl" v-if="!!select.area && !!select.spot && !!select.ticket">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal = false"></UButton>
        </template>

        <UiFlex class="mb-2">
          <UTabs v-model="tab" :items="tabItems"></UTabs>
        </UiFlex>
        
        <Transition name="page" mode="out-in">
          <StaffTicket :area="select.area" :spot="select.spot" :ticket="select.ticket" v-if="tab == 0" />
          <StaffTicketPay :area="select.area" :spot="select.spot" :ticket="select.ticket" @close="modal = false" v-else-if="tab == 1" />
        </Transition>
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const loading = ref(true)
const modal = ref(false)

const lake = ref([])
const select = ref({
  area: null,
  spot: null,
  ticket: null
})

const tab = ref(0) 
const tabItems = [
  { label: 'Thông tin' },
  { label: 'Thanh toán' },
  { label: 'Dịch vụ' },
]

const statusFormat = {
  0: { color: 'primary', label: 'Đang trống' },
  1: { color: 'orange', label: 'Đang thanh toán' },
  2: { color: 'red', label: 'Đã có người' },
}

const selectSpot = async (code) => {
  try {
    const data = await useAPI('lake/staff/spot/get', { code: code })
    
    select.value.area = data.area
    select.value.spot = data.spot
    select.value.ticket = data.ticket
    tab.value = 0
    modal.value = true
  }
  catch(e){
    select.value.area = null
    select.value.spot = null
    select.value.ticket = null
  }
}

const getLake = async () => {
  try {
    loading.value = true
    const data = await useAPI('lake/staff/get')

    lake.value = data
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}

getLake()
</script>