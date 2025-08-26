<template>
  <UiFlex type="col" v-if="!!activePot">
    <UiImg src="/images/icon/pot.png" w="1" h="1" class="w-[150px] cursor-pointer" @click="modal = true"/>
    <UiText weight="bold" size="3xl" class="Lucky mb-2" align="center">{{ useMoney().toMoney(configStore.config.charity.money) }}đ</UiText>
    <UiText color="gray" size="sm" weight="semibold" align="center" class="px-16">
      Với mỗi vé câu đặt trên hệ thống đã quyên góp <span class="text-yellow-500">{{ useMoney().toMoney(configStore.config.charity.ticket) }}đ</span> vào hũ từ thiện
    </UiText>

    <UModal v-model="modal">
      <DataCharityRank @close="modal = false"/>
    </UModal>
  </UiFlex>
</template>

<script setup>
const configStore = useConfigStore()

const modal = ref(false)

const activePot = computed(() => {
  if(!configStore.config.charity.end) return false
  if(!configStore.config.charity.start) return false
  if(!configStore.config.charity.ticket) return false
  if(!configStore.config.charity.money) return false

  const now = useDayJs().dayjs().unix()
  const start = useDayJs().dayjs(configStore.config.charity.start).unix()
  const end = useDayJs().dayjs(configStore.config.charity.end).unix()

  if(start < now && now < end) return true
  return false
})
</script>