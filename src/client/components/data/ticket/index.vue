<template>
  <UiFlex type="col" v-if="!!ticket">
    <UiFlex type="col" class="w-full" v-if="ticket.status == 1">
      <UiText class="uppercase text-[1.5rem] md:text-[2rem] mb-4" weight="semibold" align="center" color="gray">Vé Câu Sẵn Sàng</UiText>
      <UButton color="green" size="lg" :loading="starting" @click="onStart">Bắt Đầu Câu</UButton>
    </UiFlex>

    <UiFlex type="col" class="w-full" v-if="ticket.status == 2">
      <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center" color="gray">Thời Gian Còn Lại</UiText>
    
      <UiText class="text-[5rem]" weight="semibold" v-if="ticket.time.end">
        <UiCountdown :time="ticket.time.end"></UiCountdown>
      </UiText>
    </UiFlex>

    <UiFlex type="col" class="w-full" v-if="ticket.status == 3">
      <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center" color="gray">Thời Gian Dọn Đồ</UiText>
    
      <UiText class="text-[5rem]" weight="semibold" v-if="ticket.time.delay">
        <UiCountdown :time="ticket.time.delay" @end="onEnd"></UiCountdown>
      </UiText>

      <UButton color="rose" size="lg" :loading="ending" @click="onEnd">Đã Dọn Xong</UButton>
    </UiFlex>

    <div class="my-6">
      <UiText size="lg" align="center" weight="semibold" color="yellow">
        {{ ticket.area.name }}, Ô {{ ticket.spot.code }}
      </UiText>
      <UiText align="center" weight="semibold" color="gray">
        Từ {{ useDayJs().displayTime(ticket.time.start) }} đến {{ useDayJs().displayTime(ticket.time.end) }}
      </UiText>
    </div>

    <UiFlex class="gap-1 mb-2">
      <UButton size="lg" class="justify-center grow" color="rose" @click="modal.spot = true">ĐỔI VỊ TRÍ</UButton>
      <UButton size="lg" class="justify-center grow" color="primary" @click="modal.shift = true">NỐI CA</UButton>
    </UiFlex>

    <div v-if="ticket.status == 2" class="w-full">
      <UiFlex class="gap-1 mb-4 w-full md:w-auto">
        <UButton size="lg" class="justify-center grow" color="orange" icon="i-mdi-food" @click="tab = 1">Gọi Dịch Vụ</UButton>
        <UButton size="lg" class="justify-center grow" color="gray" icon="i-mdi-fish" @click="tab = 2">Cá Đã Câu</UButton>
      </UiFlex>

      <div class="w-full">
        <DataTicketItem :ticket="ticket" v-if="tab == 1" />
        <DataTicketFish :ticket="ticket" v-if="tab == 2" />
      </div>
    </div>

    <UModal v-model="modal.spot" prevent-close>
      <UiContent title="Đổi Vị Trí Câu" sub="Bạn chỉ được phép đổi vị trí tối đa 1 lần" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.spot = false"></UButton>
        </template>

        <DataTicketSpotChange :ticket="ticket" @done="onChange" />
      </UiContent>
    </UModal>

    <UModal v-model="modal.shift" prevent-close :ui="{width: 'sm:max-w-xs max-w-xs'}">
      <UiContent title="Nối Ca" sub="Thao tác nối ca câu" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.shift = false"></UButton>
        </template>

        <DataTicketShiftUp :ticket="ticket" @done="onChange" @close="modal.shift = false" />
      </UiContent>
    </UModal>
  </UiFlex>
</template>

<script setup>
const props = defineProps(['ticket'])
const emits = defineEmits(['reload'])
const tab = ref(1)

const starting = ref(false)
const ending = ref(false)

const modal = ref({
  spot: false,
  shift: false
})

const onChange = () => {
  modal.value.spot = false
  modal.value.shift = false
  emits('reload')
}

const onStart = async () => {
  try {
    starting.value = true
    await useAPI('ticket/public/start', { code: props.ticket.code })

    starting.value = false
    emits('reload')
  }
  catch(e){
    starting.value = false
  }
}

const onEnd = async () => {
  try {
    ending.value = true
    await useAPI('ticket/public/end', { code: props.ticket.code })

    ending.value = false
    navigateTo('/')
  }
  catch(e){
    ending.value = false
  }
}
</script>