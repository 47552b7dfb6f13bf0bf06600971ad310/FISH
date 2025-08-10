<template>
  <USelectMenu
    v-model="valueSelect"
    :options="options"
    size="lg"
    by="_id"
    :loading="loading"
  >
    <template #label>
      <UiText mini>{{ select ? select.title : 'Chọn thẻ khuyến mãi' }}</UiText>
    </template>

    <template #option="{ option: item }">
      {{ item.title }}
    </template>
  </USelectMenu>
</template>

<script setup>
const props = defineProps({
  modelValue: [ String, Array ],
  type: Array
})

const emit = defineEmits(['update:modelValue', 'update:voucherData'])

const valueSelect = ref(props.modelValue)
const options = ref([])
const select = ref(null)
const loading = ref(true)

watch(valueSelect, val => {
  select.value = val
  if(!!val) return emit('update:modelValue', val._id)
  emit('update:modelValue', undefined)
})

watch(select, val => {
  if(!val) return emit('update:voucherData', undefined)
  emit('update:voucherData', val)
})

const fetch = async () => {
  try {
    loading.value = true
    const list = await useAPI('voucher/public/select', { type: props.type })
    
    options.value = list
    loading.value = false
  }
  catch (e) {
    loading.value = false
  }
}

onMounted(() => setTimeout(fetch, 1))
</script>