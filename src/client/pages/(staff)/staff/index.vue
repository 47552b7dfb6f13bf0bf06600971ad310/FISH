<template>
  <div>
    <DataEmpty text="Không tìm thấy dữ liệu hồ" class="min-h-[300px]" :loading="loading" v-if="!!loading || lake.length == 0"></DataEmpty>
    
    <div v-else>
      <UiFlex class="gap-4 mb-6" justify="center" wrap>
        <UiFlex v-for="(value, key) in statusFormat" class="gap-2">
          <UBadge :color="value.color"></UBadge>
          <UiText size="sm" color="gray">{{ value.label }}</UiText>
        </UiFlex>
      </UiFlex>

      <UiFlex wrap class="gap-0.5 lg:justify-start justify-center">
        <UiFlex 
          type="col"
          v-for="spot in lake" :key="spot._id" 
          justify="center"
          :class="`bg-${statusFormat[spot.status]['color']}-500`" 
          class="p-4 w-[80px] h-[80px] cursor-pointer rounded-lg"
          @click="selectSpot(spot)"
        >
          <UiText size="xl" weight="semibold">{{ spot.code }}</UiText>
            
          <UiText size="sm" v-if="!!spot.ticket && !!spot.ticket.time">
            <UiCountdown :time="spot.ticket.time.pay" v-if="spot.status == 1"></UiCountdown>
            <UiCountdown :time="spot.ticket.time.end" v-if="spot.status == 3"></UiCountdown>
            <UiCountdown :time="spot.ticket.time.delay" v-if="spot.status == 4"></UiCountdown>
          </UiText>
        </UiFlex>
      </UiFlex>
    </div>

    <UModal v-model="modal">
      <StaffTicket :spot="select" @close="modal = false" type="spot" @changeSpot="onChangeSpot" />
    </UModal>
  </div>
</template>

<script setup>
const loading = ref(true)
const modal = ref(false)

const lake = ref([])
const select = ref()

const statusFormat = {
  0: { color: 'gray', label: 'Đang trống' },
  1: { color: 'orange', label: 'Đang thanh toán' },
  2: { color: 'green', label: 'Đã đặt chỗ' },
  3: { color: 'red', label: 'Đang câu' },
  4: { color: 'purple', label: 'Sắp kết thúc' },
}

const selectSpot = (spot) => {
  select.value = spot
  modal.value = true
}

const onChangeSpot = () => {
  modal.value = false
  getLake()
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