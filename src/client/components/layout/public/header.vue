<template>
  <header class="
    bg-[#09121b]
    sticky top-0
    w-full
    flex items-center
    h-[var(--header-size)] min-h-[var(--header-size)] max-h-[var(--header-size)]
    px-4
  ">
    <NuxtLink to="/"><UiLogo/></NuxtLink>

    <UiFlex class="ml-auto gap-1">
      <AuthSign v-if="!authStore.isLogin" />
      <LazyAuthHeader v-else />
    </UiFlex>
  </header>
</template>

<script setup>
const authStore = useAuthStore()
</script>