<template>
  <div class="relative max-w-[600px] pb-[80px] mx-auto">
    <LayoutPublicHeader class="z-[50] w-full" />

    <main class="p-4 w-full">
      <slot></slot>
    </main>

    <DataUserTicket v-if="!!authStore.isLogin" />
  </div>
</template>

<script setup>
const authStore = useAuthStore()
</script>

