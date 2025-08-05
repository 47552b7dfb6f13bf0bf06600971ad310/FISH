<template>
  <div>
    <UBreadcrumb :links="links" :ui="{ ol: 'gap-x-1', li: 'gap-x-1' }" class="mb-2">
      <template #default="{ link, isActive, index }">
        <span class="capitalize">{{ link.label }}</span>
      </template>
    </UBreadcrumb>

    <NuxtPage />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'manage',
  middleware: 'manage'
})

const route = useRoute()

const links = computed(() => {
  const homePath = `/manage`

  const list = [
    { label: 'Home', to: '/' },
    { label: 'Manage', to: homePath },
  ]

  if(route.fullPath != homePath){
    const pathArray = route.fullPath.split(`${homePath}/`)
    const pathChildArray = pathArray[1].split('/')

    pathChildArray.forEach((item, index) => {
      list.push({ label: item })
    })
  }

  return list
})
</script>