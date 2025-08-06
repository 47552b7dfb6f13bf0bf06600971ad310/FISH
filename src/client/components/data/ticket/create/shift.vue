<template>
  <div>
    <DataEmpty text="Không có dữ liệu giờ câu" class="min-h-[300px]" :loading="loading" v-if="!!loading || options.length == 0" />

    <URadioGroup v-model="selected.shift" :options="options" v-else>
      <template #label="{ option }">
        {{ option.label }}
      </template>

      <template #help="{ option }">
        <UiText class="mt-2 mb-4">{{ useMoney().toMoney(option.value.price) }} VNĐ</UiText>
      </template>
    </URadioGroup>

    <UAlert 
      title="Đăng ký cơm trưa hoặc tối" 
      :description="`${useMoney().toMoney(configStore.config.lunch.price)} VNĐ`"
      :icon="!!selected.lunch ? 'i-bx-check' : 'i-bx-radio-circle'"
      :color="!!selected.lunch ? 'green' : 'gray'"
      variant="soft"
      @click="selected.lunch = !selected.lunch"
    ></UAlert>

    <UiFlex class="mt-4 gap-1">
      <UButton color="yellow" class="grow justify-center" @click="onSelect">Xác Nhận</UButton>
      <UButton color="gray" class="grow justify-center" @click="emits('close')">Hủy</UButton>
    </UiFlex>
  </div>
</template>

<script setup>
const configStore = useConfigStore()
const emits = defineEmits(['close', 'select'])

const list = ref([])
const loading = ref(true)
const selected = ref({
  shift: null,
  lunch: false
})

const options = computed(() => {
  return list.value.map(i => {
    return {
      value: i,
      label: i.name
    }
  })
})

const onSelect = () => {
  if(!selected.value.shift) return useNotify().error('Vui lòng lựa chọn 1 ca câu')
  emits('select', selected.value)
}

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('config/public/shift/list')
    
    list.value = data
    loading.value = false
  }
  catch (e) {
    loading.value = false
  }
}
getList()
</script>