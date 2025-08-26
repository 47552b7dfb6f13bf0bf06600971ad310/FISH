<template>
  <UiContent title="Xếp Hạng" sub="Thông tin xếp hạng từ thiện" class="bg-card rounded-2xl p-4">
    <template #more>
      <UButton icon="i-bx-x" color="gray" class="ml-auto" size="2xs" square @click="emits('close')"></UButton>
    </template>

    <UTabs v-model="tab" :items="tabItems" class="mb-4"></UTabs>

    <DataEmpty text="Xếp hạng đang được cập nhật" :loading="loading" v-if="!!loading || list.length == 0" />
    <UiFlex type="col" class="grow gap-4" v-else>
      <UiFlex v-for="(item, index) in list" :key="index" class="w-full gap-2">
        <UBadge variant="soft" class="px-3">
          <UiText size="sm" class="italic">Hạng {{ index < 9 ? `0${index+1}` : index+1 }}</UiText>
        </UBadge>

        <div class="grow">
          <UiText mini size="md" weight="semibold" class="max-w-[70%]">{{ item.name || 'VÔ DANH' }}</UiText>
        </div>

        <UBadge color="gray" variant="soft" class="ml-auto px-3" size="md">
          {{ useMoney().toMoney(item.charity[tabValue[tab]]) }}đ
        </UBadge>
      </UiFlex>

      <UButton size="xs" variant="link" color="yellow" v-if="list.length == 10" @click="more">Xem Thêm</UButton>
    </UiFlex>
  </UiContent>
</template>

<script setup>
const emits = defineEmits(['close'])

const loading = ref(true)
const list = ref([])

const tab = ref(0) 
const tabItems = [
  { label: 'Tuần' },
  { label: 'Tháng' },
  { label: 'Tổng' },
]
const tabValue = {
  0: 'week',
  1: 'month',
  2: 'total',
}

const page = ref({
  size: 10,
  tab: 'week'
})
watch(() => page.value.size, () => getList())
watch(() => tab.value, () => getList())

const more = () => {
  page.value.size = page.value.size + 10
}

const getList = async () => {
  try {
    loading.value = true
    page.value.tab = tabValue[tab.value]

    const data = await useAPI('user/public/charity/rank', JSON.parse(JSON.stringify(page.value)))
    list.value = data
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}

onMounted(() => setTimeout(getList, 1))
</script>