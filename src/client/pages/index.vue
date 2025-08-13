<template>
  <div>
    <!-- <UiImg :src="configStore.config.image.banner || '/images/banner.png'" w="1" h="1" img-size="700px" class="bg-card w-[90%] rounded-2xl md:w-[60%] mb-4" /> -->
    <UiText class="uppercase text-[2rem] md:text-[3rem]" weight="semibold" align="center">{{ configStore.config.name }}</UiText>
    <UiText color="gray" class="text-base md:text-xl" align="center">{{ configStore.config.description }}</UiText>

    <UiFlex type="col" class="gap-2 mt-4">
      <UButton color="yellow" class="w-[250px] justify-center" size="xl" icon="i-tdesign-fish-filled" @click="navigateTo('/create')">ĐẶT CHỖ NGAY</UButton>
      <UButton color="orange"  class="w-[250px] justify-center" size="xl" icon="i-bxl-vimeo" @click="navigateTo('/member')">NÂNG CẤP HỘI VIÊN</UButton>
      <UButton color="purple"  class="w-[250px] justify-center" size="xl" icon="i-mdi-wheel" @click="navigateTo('/wheel')" v-if="!!configStore.config.wheel.start">VÒNG QUAY TUẦN</UButton>
    </UiFlex>

    <DataLake class="my-4"/>
    <DataRank class="my-4" />
  </div>
</template>

<script setup>
const configStore = useConfigStore()

const loading = ref(false)

const checkTicket = async () => {
  try {
    loading.value = true

    const data = await useAPI('ticket/public/check')

    loading.value = false
    if(!!data) navigateTo(`ticket/${data}`)
    else navigateTo('/create')
  }
  catch(e){
    loading.value = false
  }
}
</script>