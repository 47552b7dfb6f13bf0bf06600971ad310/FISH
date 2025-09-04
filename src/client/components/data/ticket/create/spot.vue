<template>
  <div>
    <div class="mb-4">
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline" color="green">Bước 1</UBadge>
        <UiText>Chọn khu vực hồ</UiText>

        <UButton class="ml-auto" color="gray" size="xs" @click="emits('back', 1)">Chọn lại</UButton>
      </UiFlex>

      <UAlert :title="area.name" :description="area.description" icon="i-bx-check" color="green" variant="soft"></UAlert>
    </div>

    <div>
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline">Bước 2</UBadge>
        <UiText>Chọn ô câu</UiText>
      </UiFlex>

      <UiFlex class="gap-4 mb-6" justify="center" wrap>
        <UiFlex v-for="(value, key) in statusFormat" class="gap-2">
          <UBadge :color="value.color"></UBadge>
          <UiText size="sm" color="gray">{{ value.label }}</UiText>
        </UiFlex>
      </UiFlex>

      <DataEmpty text="Không có dữ liệu ô câu" class="min-h-[300px]" :loading="loading" v-if="!!loading || list.length == 0" />

      <UiFlex wrap class="gap-0.5" justify="center" v-else>
        <UiFlex 
          type="col"
          v-for="spot in listFormat" :key="spot._id" 
          justify="center"
          :class="`bg-${statusFormat[spot.status]['color']}-500`" 
          class="p-4 w-[70px] h-[70px] cursor-pointer rounded-lg"
          @click="getSpot(spot)"
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

    <UModal v-model="modal" preventClose :ui="{width: 'sm:max-w-xs max-w-xs'}">
      <UiContent :title="`Ô số ${selectData.spot.code}`" sub="Lựa chọn thời gian câu và đăng ký cơm" class="bg-card rounded-2xl p-4" v-if="selectData.spot">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal = false"></UButton>
        </template>

        <DataTicketCreateShift :area="area" @select="selectShift" @close="modal = false" />
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const authStore = useAuthStore()

const props = defineProps(['area'])
const emits = defineEmits(['back', 'spot'])

const list = ref([])
const loading = ref(true)

const modal = ref(false)
const selectData = ref({
  spot: null,
  shift: null,
  lunch: false
})

const statusFormat = {
  0: { color: 'gray', label: 'Đang trống' },
  1: { color: 'orange', label: 'Đang thanh toán' },
  2: { color: 'green', label: 'Đã đặt chỗ' },
  3: { color: 'red', label: 'Đang câu' },
  4: { color: 'purple', label: 'Sắp kết thúc' },
}

const listFormat = computed(() => {
  return list.value.sort((a,b) => Number(a.code) - Number(b.code))
})

const selectShift = (data) => {
  selectData.value.shift = data.shift
  selectData.value.lunch = data.lunch
  emits('spot', selectData.value)
}

const getSpot = async (spot) => {
  try {
    if(!authStore.isLogin) return authStore.setModal(true)
    const data = await useAPI('lake/public/spot/get', { _id: spot._id })

    if(data.ticket) return navigateTo(`/ticket/${data.ticket}`)
    else {
      selectData.value.spot = spot
      modal.value = true
    }
  }
  catch (e) {
  }
}

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('lake/public/spot/list', {
      area: props.area?._id
    })
    
    list.value = data
    loading.value = false
  }
  catch (e) {
    loading.value = false
  }
}
getList()
</script>
