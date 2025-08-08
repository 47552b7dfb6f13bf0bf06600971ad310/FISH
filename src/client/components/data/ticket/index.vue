<template>
  <UiFlex type="col" v-if="!!ticket">
    <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center" color="gray">Thời Gian Còn Lại</UiText>
  
    <UiText class="text-[5rem]" weight="semibold" v-if="ticket.end">
      <UiCountdown :time="ticket.end" @end="onEnd"></UiCountdown>
    </UiText>

    <div class="mb-6">
      <UiText size="base" align="center" color="gray">Vị trí ngồi</UiText>
      <UiText size="lg" align="center" weight="semibold" color="yellow">
        {{ ticket.area.name }}, Ô {{ ticket.spot.code }}
      </UiText>
    </div>

    <UiFlex class="gap-1 mb-4 w-full md:w-auto">
      <UButton size="lg" class="justify-center grow" color="orange" icon="i-mdi-food" @click="tab = 1">Gọi Dịch Vụ</UButton>
      <UButton size="lg" class="justify-center grow" color="gray" icon="i-mdi-fish" @click="tab = 2">Cá Đã Câu</UButton>
    </UiFlex>

    <div class="w-full">
      <DataTicketItem :ticket="ticket" v-if="tab == 1" />
      <DataTicketFish :ticket="ticket" v-if="tab == 2" />
    </div>
  </UiFlex>
</template>

<script setup>
const props = defineProps(['ticket'])
const tab = ref(1)

const onEnd = async () => {

}
</script>