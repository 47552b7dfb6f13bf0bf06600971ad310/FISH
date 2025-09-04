<template>
  <div class="relative h-full min-h-full pt-[var(--header-size)]">
    <LayoutStaffHeader />

    <main class="p-4 max-w-[1200px] mx-auto">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
watch(() => authStore.isLogin, (val) => !val && navigateTo('/'))
</script>

