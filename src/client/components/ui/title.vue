<template>
  <UiFlex class="gap-4">
    <UiIcon :name="icon" size="6" color="gray" v-if="!!icon" />
    <UiText class="bg-title rounded-r-3xl md:text-xl text-base py-1.5 SVN" style="letter-spacing: 1px;" weight="bold">{{ name || '...' }}</UiText>
  </UiFlex>
</template>

<script setup>
const props = defineProps(['icon', 'name'])
</script>