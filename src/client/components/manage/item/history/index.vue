<template>
  <div>
    <UiFlex>
      <UTabs v-model="tab" :items="tabItems"></UTabs>
    </UiFlex>

    <Transition name="page" mode="out-in">
      <ManageItemHistoryImport v-if="tab == 0" :fetch-id="fetchId" />
      <ManageItemHistoryExport v-else-if="tab == 1" :fetch-id="fetchId" />
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps(['fetchId'])
const tab = ref(0) 
const tabItems = [
  { label: 'Nhập kho' },
  { label: 'Bán ra' },
]
</script>