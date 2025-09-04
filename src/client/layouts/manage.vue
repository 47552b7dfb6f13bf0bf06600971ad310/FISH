<template>
  <div class="relative h-screen min-h-full">
    <LayoutManageHeader />

    <UiFlex class="xl:gap-6 gap-0 h-screen pt-[var(--header-size)]" items="start">
      <aside class="hidden xl:block w-[250px] h-screen fixed top-0 left-0 overflow-y-auto HideScroll pt-[var(--header-size)] bg-gray-1000">
        <LayoutManageNav />
      </aside>

      <main class="relative h-full flex-1 xl:ml-[250px] p-4 overflow-x-hidden">
        <div class="max-w-[1400px] mx-auto">
          <slot></slot>
        </div>
      </main>
    </UiFlex>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
watch(() => authStore.isLogin, (val) => !val && navigateTo('/'))
</script>

