<template>
  <div>
    <!-- <UiTitle name="Xếp Hạng Tuần" icon="i-solar-ranking-bold-duotone" class="mb-4" /> -->

    <DataEmpty text="Xếp hạng hiện tại đang được cập nhật" :loading="loading" v-if="!!loading || list.length == 0" />
    <UiFlex type="col" class="grow gap-4" v-else>
      <UiFlex v-for="(item, index) in list" :key="index" class="w-full gap-2">
        <UBadge variant="soft" class="px-3">
          <UiText size="sm" class="italic">Hạng {{ item.rank < 10 ? `0${item.rank}` : item.rank }}</UiText>
        </UBadge>

        <div class="grow">
          <UiText mini size="md" weight="semibold" class="max-w-[70%]">{{ item.user.name || 'VÔ' }}</UiText>
        </div>

        <UBadge color="gray" variant="soft" class="ml-auto px-3" size="md">
          {{ useMoney().toMoney(item.totalAmount) }} con {{ useMoney().toMoney(item.totalKg) }} kg
        </UBadge>
      </UiFlex>
    </UiFlex>
  </div>
</template>

<script setup>
const loading = ref(false)
const list = ref([])

const getRank = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/public/fish/rank')

    list.value = data
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}

onMounted(() => setTimeout(() => getRank(), 1))
</script>