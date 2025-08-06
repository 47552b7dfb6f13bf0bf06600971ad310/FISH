<template>
  <NuxtLayout class="relative">
    <NuxtLoadingIndicator :height="2" />
    <UNotifications />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const runtimeConfig = useRuntimeConfig()
const configStore = useConfigStore()

// Meta Seo
useSeoMeta({
  title: () => configStore.config.name,
  ogTitle: () => configStore.config.name,
  description: () => configStore.config.description,
  ogDescription: () => configStore.config.description,
  ogImage: () => new URL(configStore.config.image.banner || '/images/null.webp', runtimeConfig.public.clientURL), 
  ogImageAlt: () => configStore.config.name,
  ogType: 'website'
})
</script>