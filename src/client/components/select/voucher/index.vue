<template>
  <UiFlex class="gap-1" wrap>
    <DataEmpty text="Bạn không có thẻ khuyến mãi nào" :loading="loading" v-if="options.length == 0 || !!loading" />

    <UiFlex 
      class="cursor-pointer rounded-2xl p-4 gap-2" 
      v-for="item in options" :key="item._id" 
      :class="{
        'bg-gray-1000': !select || (!!select && select._id != item._id),
        'bg-red-500': !!select && select._id == item._id
      }" 
      @click="onSelect(item)"
    >
      <UiIcon name="i-ic-baseline-discount" size="5"></UiIcon>
      <UiText weight="semibold" size="sm" class="mr-auto">{{ item.title }}</UiText>  
    </UiFlex>
  </UiFlex>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  type: Array
})

const emit = defineEmits(['update:modelValue', 'update:voucherData', 'no'])

const valueSelect = ref(props.modelValue)
const options = ref([])
const select = ref(null)
const loading = ref(true)

const onSelect = (item) => {
  select.value = item
  valueSelect.value = item
}

watch(valueSelect, val => {
  if(!!val) return emit('update:modelValue', val)
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

    if(options.value.length == 0) emit('no')
    // if(options.value.length > 0){
    //   select.value = options.value[0]
    //   valueSelect.value = select.value._id
    // }
    // else {
    //   emit('no')
    // }
  }
  catch (e) {
    loading.value = false
  }
}

onMounted(() => setTimeout(fetch, 1))
</script>