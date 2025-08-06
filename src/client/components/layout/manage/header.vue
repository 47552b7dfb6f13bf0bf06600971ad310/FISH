<template>
  <header class=" 
    fixed safe-area-top
    top-0 left-0 z-50 
    w-full
    bg-gray-1000 
    flex items-center
    h-[var(--header-size)] max-h-[var(--header-size)]
    px-4
    md:gap-4
  ">
    <LayoutNavSlide class="flex lg:hidden" />
    
    <UiText weight="semibold" size="2xl" color="primary" class="italic">
      Manage <span class="text-white text-base">Pannel</span>
    </UiText>

    <UButton @click="navigateTo('/')" icon="i-bx-power-off" color="rose" variant="link" square class="ml-auto">Thoát</UButton>
  </header>
</template>

<script setup>
const authStore = useAuthStore()
</script>