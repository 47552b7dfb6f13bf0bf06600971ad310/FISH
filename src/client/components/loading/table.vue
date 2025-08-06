<template>
  <UiFlex justify="center" class="
    absolute top-0 left-0 
    min-w-full min-h-full 
    bg-gray opacity-90
    z-10
    rounded-2xl
  ">
    <UiIcon name="i-bx-loader-alt" size="6" class="animate-spin mr-2" color="primary" />
    <UiText size="sm" weight="semibold" color="gray">{{ text || 'Đang tải...' }}</UiText>
  </UiFlex>
</template>

<script setup>
const props = defineProps(['text'])
</script>