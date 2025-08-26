<template>
  <div>
    <!-- <UiImg :src="configStore.config.image.banner || '/images/banner.png'" w="1" h="1" img-size="700px" class="bg-card w-[90%] rounded-2xl md:w-[60%] mb-4" /> -->
    <UiText class="uppercase text-[2rem] md:text-[3rem]" weight="semibold" align="center">{{ configStore.config.name }}</UiText>
    <UiText color="gray" class="text-base md:text-xl" align="center">{{ configStore.config.description }}</UiText>

    <div class="grid grid-cols-12 gap-2 mt-4" wrap>
      <UButton color="yellow" class="col-span-6 justify-center" size="xl" icon="i-tdesign-fish-filled" @click="toCreate">ĐẶT CHỖ</UButton>
      <UButton color="orange"  class="col-span-6 justify-center" size="xl" icon="i-bxl-vimeo" @click="navigateTo('/member')">HỘI VIÊN</UButton>
      <UButton color="purple"  class="col-span-6 justify-center" size="xl" icon="i-mdi-wheel" @click="navigateTo('/wheel')">VÒNG QUAY</UButton>
      <DataDownload class="col-span-6" />
    </div>

    <DataCharity class="my-4" />
    <DataLake class="my-4"/>
    <DataRank class="my-4" />

    <UModal v-model="modal" prevent-close :ui="{width: 'max-w-[300px]'}">
      <UiFlex type="col" justify="center" class="bg-card rounded-2xl p-6">
        <UiIcon name="i-bxs-info-circle" size="20" color="yellow" class="mb-4" />
        <UiText weight="bold" align="center" size="3xl" class="mb-4">CHÚ Ý</UiText>
        <UiText color="yellow" align="center" size="lg" weight="semibold" class="mb-2">Để tránh bị trùng ô, quý khách vui lòng đến ô câu trước rồi hãy tiến hành đặt chỗ</UiText>
        <UButton color="gray" @click="successRead" variant="link">Tự động chuyển sau {{ num }}s</UButton>
      </UiFlex>
    </UModal>
  </div>
</template>

<script setup>
const configStore = useConfigStore()

const modal = ref(false)
const num = ref(5)
const anim = ref(null)

const isOpenBook = computed(() => {
  if(!configStore.config.time.ticket) return true
  if(!!configStore.config.time.ticket.start && !!configStore.config.time.ticket.end) {
    function toMinutes(hhmm) {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    }

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const start = toMinutes(configStore.config.time.ticket.start);
    const end = toMinutes(configStore.config.time.ticket.end);

    if (start < end) {
      return nowMinutes >= start && nowMinutes < end;
    } 
    else {
      return nowMinutes >= start || nowMinutes < end;
    }
  }
  else return true
})

const toCreate = () => {
  if(!isOpenBook.value) return useNotify().error('Hồ câu chưa mở, vui lòng quay lại sau')
  else {
    modal.value = true
    num.value = 5
    anim.value = setInterval(() => {
      num.value = num.value - 1
      if(num.value == 0) successRead()
    }, 1000)
  }
}

const successRead = () => {
  if(num.value != 0) return
  if(anim.value) clearInterval(anim.value), anim.value = null
  navigateTo('/create')
}
</script>