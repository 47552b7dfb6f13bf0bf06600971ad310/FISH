<template>
  <div>
    <!-- <UiImg :src="configStore.config.image.banner || '/images/banner.png'" w="1" h="1" img-size="700px" class="bg-card w-[90%] rounded-2xl md:w-[60%] mb-4" /> -->
    <UiText class="uppercase text-[2rem] md:text-[3rem]" weight="semibold" align="center">{{ configStore.config.name }}</UiText>
    <UiText color="gray" class="text-base md:text-xl" align="center">{{ configStore.config.description }}</UiText>

    <div class="grid grid-cols-12 gap-2 mt-4" wrap>
      <UButton color="yellow" class="col-span-6 justify-center" size="xl" icon="i-tdesign-fish-filled" @click="navigateTo('/create')">ĐẶT CHỖ</UButton>
      <UButton color="orange"  class="col-span-6 justify-center" size="xl" icon="i-bxl-vimeo" @click="navigateTo('/member')">HỘI VIÊN</UButton>
      <UButton color="purple"  class="col-span-6 justify-center" size="xl" icon="i-mdi-wheel" @click="navigateTo('/wheel')">VÒNG QUAY</UButton>
      <DataDownload class="col-span-6" />
    </div>

    <DataLake class="my-4"/>
    <DataRank class="my-4" />
  </div>
</template>

<script setup>
const configStore = useConfigStore()
</script>