<template>
  <USelectMenu
    v-model="voucherSelect"
    :searchable="search"
    size="lg"
    by="_id"
    class="grow"
    debounce
  >
    <template #label>
      {{ !!select ? select.title : 'Tìm kiếm thẻ quà tặng' }}
    </template>

    <template #option="{ option: item }">
      {{ item.title }}
    </template>
  </USelectMenu>
</template>

<script setup>
const props = defineProps(['modelValue', 'voucherData'])
const emit = defineEmits(['update:modelValue', 'update:voucherData'])
const voucherSelect = ref(props.modelValue)
const select = ref()

watch(voucherSelect, val => {
  select.value = val
  if(!!val) return emit('update:modelValue', val._id)
  emit('update:modelValue', undefined)
})

watch(select, val => {
  if(!val) return emit('update:voucherData', undefined)
  emit('update:voucherData', val)
})

const search = async (key) => {
  const list = await useAPI('voucher/manage/select', { key: key, _id: props.modelValue })

  if(!!props.modelValue && !select.value){
    const index = list.findLastIndex((i) => i._id == props.modelValue)
    if(index != -1){
      const voucher = list[index]
      select.value = { _id: voucher._id, title: voucher.title }
    }
  }

  return list.map(voucher => ({ _id: voucher._id, title: voucher.title })).filter(Boolean)
}
</script>