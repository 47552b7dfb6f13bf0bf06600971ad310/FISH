<template>
  <UiFlex type="col">
    <UiText class="uppercase text-[1.5rem] md:text-[2rem] mb-4" weight="semibold" align="center">Hệ Thống Đặt Chỗ</UiText>

    <DataTicketCreateArea v-if="step == 1" class="w-full" @area="selectArea"/>
    <DataTicketCreateSpot v-else-if="step == 2" :area="state.area" class="w-full" @spot="selectSpot" @back="back"/>
    <DataTicketCreatePay v-else-if="step == 3" :area="state.area" :spot="state.spot" :shift="state.shift" :lunch="state.lunch" class="w-full" @back="back"/>
  </UiFlex>
</template>

<script setup>
const authStore = useAuthStore()

const step = ref(1)

const state = ref({
  area: null,
  spot: null,
  shift: null,
  lunch: false
})

const selectArea = (data) => (state.value.area = data, step.value = 2)
const selectSpot = (data) => {
  state.value.spot = data.spot
  state.value.shift = data.shift
  state.value.lunch = data.lunch
  step.value = 3
}

const back = (data) => {
  if(data == 1){
    state.value.area = null
    state.value.spot = null
    state.value.shift = null
    state.value.lunch = false
    step.value = 1
  }
  if(data == 2){
    state.value.spot = null
    state.value.shift = null
    state.value.lunch = false
    step.value = 2
  }
}

const checkTicket = async () => {
  try {
    const data = await useAPI('ticket/public/check')
    if(!!data) navigateTo(`ticket/${data}`)
  }
  catch(e){
    return false
  }
}

watch(() => authStore.isLogin, (val) => !!val && checkTicket())
</script>