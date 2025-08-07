<template>
  <div class="relative h-full min-h-full pt-[var(--header-size)]">
    <LayoutStaffHeader />

    <UiFlex class="px-4 py-4 lg:gap-6 gap-0" items="start">
      <UContainer 
        class="relative grow !px-0" 
        style="min-height: calc(100% - var(--header-size));" 
        :ui="{ constrained: 'overflow-x-hidden' }
      ">
        <slot></slot>
      </UContainer>
    </UiFlex>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
watch(() => authStore.isLogin, (val) => !val && navigateTo('/'))
</script>

