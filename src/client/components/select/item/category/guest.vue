<template>
  <UiFlex class="gap-1">
    <UButton 
      v-for="item in options" :key="item._id"
      :color="select == item._id ? 'orange' : 'gray'"
      :variant="select == item._id ? 'outline' : 'solid'"
      :disabled="select == item._id"
      @click="select = item._id"
    >
      {{ item.label }}
    </UButton>
  </UiFlex>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const loading = ref(true)
const select = ref(props.modelValue)
const options = ref(props.options)
watch(select, (val) => emit('update:modelValue', val))

const fetch = async () => {
  try {
    loading.value = true
    const list = await useAPI('item/public/category/select')
    
    options.value = options.value.concat(list.map(i => ({ _id: i._id, label: i.name })))
    if(options.value.length > 0) select.value = options.value[0]._id
    loading.value = false
  }
  catch (e) {
    loading.value = false
  }
}
onMounted(() => setTimeout(() => fetch(), 1))
</script>