<template>
  <UiFlex class="gap-1">
    <UiFlex class="cursor-pointer w-full rounded-2xl p-4 gap-2" :class="{
      'bg-gray': select != 'MONEY',
      'bg-primary-600': select == 'MONEY',
    }" @click="onSelect('MONEY')">
      <UiText weight="semibold" class="mr-auto">Tiền Mặt</UiText>
      <UiIcon name="i-bx-money" size="6"></UiIcon>
    </UiFlex>

    <UiFlex class="cursor-pointer w-full rounded-2xl p-4 gap-2" :class="{
      'bg-gray': select != 'BANK',
      'bg-primary-600': select == 'BANK',
    }" @click="onSelect('BANK')">
      <UiText weight="semibold" class="mr-auto">C.Khoản</UiText>
      <UiIcon name="i-bxs-credit-card" size="6"></UiIcon>
    </UiFlex>
  </UiFlex>
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const select = ref(props.modelValue)

const onSelect = (val) => (select.value = val)

watch(() => select.value, (val) => emit('update:modelValue', val))
</script>