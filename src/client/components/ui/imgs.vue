<template>
  <UiFlex class="gap-1 flex-wrap" v-if="src && src.length > 0">
    <UiFlex 
      v-for="(item, index) in src" :key="index"
      justify="center"
      class="
        h-16 w-16 min-w-16 min-h-16 max-h-16 max-w-16
        bg-gray-200 dark:bg-gray-800
        rounded-2xl cursor-pointer overflow-hidden
      "
      @click="onViewFile(item, index)"
    >
      <UiImg :src="item" w="1" h="1" class="w-16 h-16"/>
    </UiFlex>
  </UiFlex>

  <UModal v-model="open" fullscreen :ui="{
    fullscreen: 'w-auto h-auto max-w-full max-h-[100vh]'
  }">
    <UiFlex justify="center" class="w-full h-full">
      <img :src="imgSelect.src" class="max-h-[90vh] w-auto object-contain rounded-2xl"/>
    </UiFlex>

    <UiFlex class="absolute -top-4 -right-4">
      <UButton color="gray" icon="i-bx-x" @click="open = false"></UButton>
    </UiFlex>
  </UModal>
</template>

<script setup>
const props = defineProps(['src'])
const open = ref(false)

const imgSelect = ref({
  src: null,
  index: null
})

const onViewFile = (src, index) => {
  imgSelect.value.src = src
  imgSelect.value.index = index
  open.value = true
}
</script>