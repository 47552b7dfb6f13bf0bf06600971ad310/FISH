<template>
  <USelectMenu 
    v-model="type" 
    size="lg" 
    value-attribute="value"
    placeholder="Chọn loại quà"
    :options="[
      { label: 'Mất lượt', value: 0 },
      { label: 'Vật phẩm ', value: 1 },
    ]"
  >
    <template #label>
      <span v-if="type !== undefined">{{ typeFormat[type].label }}</span>
      <span v-else>Chọn loại quà</span>
    </template>

    <template #option="{ option: option }">
      <span>{{ typeFormat[option.value].label }}</span>
    </template>
  </USelectMenu>
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const type = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
}) 

const typeFormat = {
  0: { label: 'Mất lượt' },
  1: { label: 'Vật phẩm' },
}
</script>