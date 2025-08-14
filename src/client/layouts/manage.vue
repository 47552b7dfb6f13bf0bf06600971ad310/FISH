<template>
  <div class="relative h-full min-h-full pt-[var(--header-size)]">
    <LayoutManageHeader />

    <UiFlex class="px-4 py-4 lg:gap-6 gap-0 h-full" items="start">
      <div class="
        HideScroll
        sticky top-[calc(var(--header-size)+1rem)]
        bg-gray-1000 bg-opacity-90 backdrop-blur-lg rounded-2xl
        min-h-[calc(100vh-2rem-var(--header-size))] max-h-[calc(100vh-2rem-var(--header-size))] overflow-y-auto
        lg:min-w-[250px] lg:max-w-[250px] lg:w-[250px]
        hidden xl:flex
      ">
        <LayoutManageNav />
      </div>

      <UContainer 
        class="relative grow h-full !px-0 min-h-[calc(100vh-2rem-var(--header-size))] max-h-[calc(100vh-2rem-var(--header-size))] HideScroll" 
        :ui="{ constrained: 'overflow-x-hidden overflow-y-auto' }
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

