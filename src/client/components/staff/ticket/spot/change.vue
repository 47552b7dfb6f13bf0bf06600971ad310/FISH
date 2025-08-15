<template>
  <DataEmpty text="Không có ô nào khả dụng cho bạn đổi" :loading="loading" v-if="!!loading || list.length == 0" />
  <UiFlex wrap class="gap-0.5 lg:px-8 px-0" justify="center" v-else>
    <UiFlex 
      type="col"
      v-for="spot in list" :key="spot._id" 
      justify="center"
      class="p-4 w-[70px] h-[70px] cursor-pointer rounded-lg bg-gray-500"
      @click="select(spot)"
    >
      <UiText size="xl" weight="semibold">{{ spot.code }}</UiText>
    </UiFlex>
  </UiFlex>

  <UModal v-model="modal" preventClose>
    <UiContent title="Xác Nhận" class="bg-card rounded-2xl p-4" color="green" no-dot>
      <UAlert title="Chú Ý" icon="i-bxs-info-circle" color="green" variant="soft">
        <template #description>
          Bạn chắc chắn muốn đổi sang ô <b>{{ spot.code }}</b>
        </template>
      </UAlert>

      <UiFlex class="mt-4" justify="end">
        <UButton @click="action" :loading="changing" color="green">Xác Nhận</UButton>
        <UButton color="gray" @click="modal = false" :disabled="changing" class="ml-1">Đóng</UButton>
      </UiFlex>
    </UiContent>
  </UModal>
</template>

<script setup>
const props = defineProps(['ticket'])
const emits = defineEmits(['done'])

const list = ref([])
const spot = ref()

const loading = ref(true)
const modal = ref(false)
const changing = ref(false)

const select = (data) => {
  modal.value = true
  spot.value = data
}

const action = async () => {
  try {
    changing.value = true
    await useAPI('ticket/staff/spot/change', { _id: spot.value._id, ticket: props.ticket._id })
    changing.value = false
    modal.value = false
    emits('done')
  }
  catch(e){
    changing.value = false
  }
}

const getSpots = async () => {
  try {
    if(!props.ticket) throw true
    if(!props.ticket.area) throw true
    if(!props.ticket.area._id) throw true

    loading.value = true
    const data = await useAPI('lake/staff/spot/empty', { area: props.ticket.area._id })

    list.value = data
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}
onMounted(() => setTimeout(() => getSpots(), 1))
</script>