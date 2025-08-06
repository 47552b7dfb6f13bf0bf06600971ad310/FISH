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

      <UiFlex wrap class="gap-0.5 lg:px-8 px-0" justify="center">
        <UiFlex 
          v-for="spot in list" :key="spot._id" 
          justify="center"
          :class="`bg-${statusFormat[spot.status]['color']}-500`" 
          class="p-4 w-[70px] h-[70px] font-semibold cursor-pointer text-xl rounded-lg"
          @click="selectSpot(spot)"
        >
          {{ spot.code }}
        </UiFlex>
      </UiFlex>
    </div>

    <UModal v-model="modal" preventClose :ui="{width: 'sm:max-w-xs max-w-xs'}">
      <UiContent :title="`Ô số ${selectData.spot.code}`" sub="Lựa chọn thời gian câu và đăng ký cơm" class="bg-card rounded-2xl p-4" v-if="selectData.spot">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal = false"></UButton>
        </template>

        <DataTicketCreateShift @select="selectShift" @close="modal = false" />
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
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
  0: { color: 'primary', label: 'Đang trống' },
  1: { color: 'orange', label: 'Đang thanh toán' },
  2: { color: 'red', label: 'Đã có người' },
}

const selectSpot = (data) => {
  if(data.status != 0) return useNotify().error('Không thể chọn ô này')
  selectData.value.spot = data
  modal.value = true
}

const selectShift = (data) => {
  selectData.value.shift = data.shift
  selectData.value.lunch = data.lunch
  emits('spot', selectData.value)
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
