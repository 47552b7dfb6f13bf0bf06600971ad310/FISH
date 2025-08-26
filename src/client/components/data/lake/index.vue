<template>
  <div class="grid grid-cols-12 gap-2" v-if="!!lake">
    <div v-for="area in lake" :key="area._id" class="col-span-12 bg-gray-1000 p-4 rounded-2xl">
      <UiFlex justify="between" class="mb-2">
        <UiText weight="semibold" size="lg" color="yellow">{{ area.name }}</UiText>
        <div class="text-end">
          <UiText size="sm" :class="area.spot.online > 0 ? 'text-green-500' : 'text-gray-400'">
            {{ area.spot.online }} cần thủ đang câu
          </UiText>
          <UiText size="sm" :class="area.spot.empty > 0 ? 'text-primary-500' : 'text-gray-400'">
            {{ area.spot.empty }} ô trống
          </UiText>
        </div>
      </UiFlex>

      <table class="w-full text-sm mb-2">
        <thead>
          <tr class="text-left text-gray-400">
            <th class="py-2">Loại Cá</th>
            <th class="py-2">Cá Nền</th>
            <th class="py-2">Báo Cá</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fish in area.fishs" :key="fish._id" class="border-t border-gray-800">
            <td class="py-2">{{ fish.name }}</td>
            <td class="py-2">
              <UiText color="primary" v-if="fish.display != 0">{{ fish.nowAmount }} con</UiText>
              <UiText color="orange" v-else>{{ fish.nowKg }} kg</UiText>
            </td>
            <td class="py-2">
              <UiText color="primary" v-if="fish.display != 0">{{ fish.catchAmount }} con</UiText>
              <UiText color="orange" v-else>{{ fish.catchKg }} kg</UiText>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- <UiFlex justify="between" class="mb-1">
        <UiText size="sm" color="pink">Doanh thu hôm nay</UiText>
        <UiText weight="semibold" color="yellow">{{ useMoney().toMoney(area.revenue) }}</UiText>
      </UiFlex> -->

      <!-- <UiFlex justify="between" class="mb-1" v-if="!!area.pig && area.pig.money > 0">
        <UiText size="sm" color="yellow">Hũ Heo</UiText>
        <UiFlex class="gap-1">
          <UiText weight="semibold" color="pink" size="lg">{{ useMoney().toMoney(area.pig.money) }}</UiText> 
          <UiText weight="semibold" size="sm">VNĐ</UiText> 
        </UiFlex>  
      </UiFlex> -->

      <UiFlex justify="between">
        <UiText size="sm" color="yellow">Ước tính bồi ngày mai</UiText>
        <UiFlex class="gap-1">
          <UiText weight="semibold" color="pink" size="lg">{{ getFuture(area) }}</UiText> 
          <UiText weight="semibold" size="sm">kg</UiText> 
        </UiFlex>  
      </UiFlex>
    </div>
  </div>
</template>

<script setup>
const { $socket } = useNuxtApp()
const configStore = useConfigStore()
const lake = ref(null)
const getLake = async () => {
  try {
    const data = await useAPI('lake/public/get')
    lake.value = data
  }
  catch(e){
    lake.value = null
  }
}

const getFuture = (area) => {
  if(!area.future) return 0
  if(!area.future.price) return 0
  if(!area.future.percent) return 0
  if(!area.revenue) return 0

  const futureRevenue = Math.round(area.revenue * area.future.percent / 100)
  const futureKg = futureRevenue / area.future.price
  return futureKg.toFixed(1)
}

onMounted(() => {
  setTimeout(() => getLake(), 1)

  $socket.on('update-lake-info', async (data) => {
    if(!data) return
    lake.value = data
    await configStore.bootConfig()
  })
})
</script>