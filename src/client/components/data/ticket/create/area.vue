<template>
  <div>
    <UiFlex class="gap-2 mb-4">
      <UBadge variant="outline">Bước 1</UBadge>
      <UiText>Chọn khu vực hồ</UiText>
    </UiFlex>

    <DataEmpty text="Không có dữ liệu khu vực" class="min-h-[300px]" :loading="loading" v-if="!!loading || list.length == 0" />

    <UiFlex type="col" class="gap-2" v-else>
      <UiFlex type="col" v-for="area in list" :key="area._id" class="bg-gray-1000 w-full rounded-2xl overflow-hidden">
        <UiImg :src="area.image" w="16" h="9" class="w-full" />
        <UiFlex class="w-full p-4 gap-4">
          <div class="mr-auto">
            <UiText size="lg" weight="semibold">{{ area.name }}</UiText>
            <UiText size="sm" color="gray">{{ area.description }}</UiText>
          </div>
          <UButton color="yellow" @click="select(area)">Chọn Khu Vực</UButton>
        </UiFlex>
      </UiFlex>
    </UiFlex>
  </div>
</template>

<script setup>
const emits = defineEmits(['area'])

const list = ref([])
const loading = ref(true)

const select = (data) => {
  emits('area', data)
}

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('lake/public/area/list')
    
    list.value = data
    loading.value = false
  }
  catch (e) {
    loading.value = false
  }
}
getList()
</script>