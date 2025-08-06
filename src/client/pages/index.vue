<template>
  <UiFlex type="col">
    <UiImg :src="configStore.config.image.banner || '/images/banner.png'" w="1" h="1" img-size="700px" class="bg-card w-[90%] rounded-2xl md:w-[60%] mb-4" />

    <UiText class="uppercase text-[2rem] md:text-[3rem]" weight="semibold" align="center">{{ configStore.config.name }}</UiText>
    <UiText color="gray" class="text-base md:text-xl" align="center">{{ configStore.config.description }}</UiText>

    <UButton color="yellow" class="mt-4" size="xl" @click="navigateTo('/dat-cho')">ĐẶT CHỖ NGAY</UButton>
  </UiFlex>
</template>

<script setup>
const configStore = useConfigStore()
</script>