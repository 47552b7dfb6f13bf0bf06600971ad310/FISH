<template>
  <UiFlex v-if="!!ticket" @click="goToTicket" class="gap-1 fixed bottom-0 bg-[#071b27] w-full px-4 py-3 rounded-t-2xl cursor-pointer max-w-[600px] mx-auto shadow-2xl">
    <div class="mr-auto">
      <UiText weight="semibold" color="yellow">Vé của bạn</UiText>
      <UiText size="sm" v-if="!!ticket.area && !!ticket.spot">
        {{ ticket.area.name || '...' }} - {{ ticket.spot.code || '...' }}
      </UiText>
      <UiText size="sm" v-else>
        {{ ticket.area.code }}
      </UiText>
    </div>

    <div>
      <UiFlex class="gap-1">
        <UBadge variant="soft" :color="statusTicket[ticket.status]['color']">{{ statusTicket[ticket.status]['label'] }}</UBadge>
        <UBadge variant="soft" color="gray">
          <UiText v-if="ticket.time">
            <UiCountdown :time="ticket.time.pay" v-if="ticket.status == 0" @end="getTicket"></UiCountdown>
            <UiCountdown :time="ticket.time.end" v-if="ticket.status == 2" @end="getTicket"></UiCountdown>
            <UiCountdown :time="ticket.time.delay" v-if="ticket.status == 3" @end="getTicket"></UiCountdown>
          </UiText>
        </UBadge>
      </UiFlex>

      <UiText class="text-xs text-primary mt-2" align="end">Bấm để xem</UiText>
    </div>
  </UiFlex>
</template>

<script setup>
const loading = ref(false)
const ticket = ref(null)

const statusTicket = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã thanh toán', color: 'primary' },
  2: { label: 'Đang Câu', color: 'green' },
  3: { label: 'Sắp kết thúc', color: 'purple' },
  4: { label: 'Kết thúc', color: 'red' },
}

const goToTicket = () => {
  if(!ticket.value) return
  navigateTo(`/ticket/${ticket.value.code}`)
}

const getTicket = async () => {
  try {
    loading.value = true

    const data = await useAPI('ticket/public/check')
    ticket.value = data

    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}

onMounted(() => setTimeout(getTicket, 1))
</script>