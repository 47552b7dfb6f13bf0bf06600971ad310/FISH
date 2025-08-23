<template>
  <div>
    <LoadingTable v-if="loading" />

    <UTable :columns="columns" :rows="list" class="BoxBlock rounded-xl">
      <template #name-data="{ row }">
        <UiText color="rose" weight="semibold" v-if="row.amount == 0">{{ row.name }} </UiText>
        <UiText color="gray" weight="semibold" :class="{
          'Lucky': row.percent <= 10
        }" v-else>{{ row.name }}</UiText>
      </template>
    </UTable>
  </div>
</template>

<script setup>
const emits = defineEmits(['close'])
const loading = ref(false)

const list = ref([])

const columns = [
  {
    key: 'name',
    label: 'Phần thưởng',
  },{
    key: 'amount',
    label: 'Số giải còn lại',
  }
]

const getList = async () => {
  try {
    loading.value = true
    const data = await useAPI('wheel/public/view')
    
    list.value = data
    loading.value = false
  }
  catch (e) {
    loading.value = false
  } 
}

onMounted(() => setTimeout(getList, 1))
</script>