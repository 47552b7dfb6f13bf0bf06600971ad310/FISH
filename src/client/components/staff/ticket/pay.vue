<template>
  <div v-if="!!area && !!spot && !!ticket">
    <UiFlex type="col" class="gap-4">
      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Trạng thái</UiText>
        <UBadge variant="soft" :color="statusPay[ticket.status]['color']">{{ statusPay[ticket.status]['label'] }}</UBadge>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.pay">
        <UiText weight="semibold" color="gray" size="sm">Phương thức</UiText>
        <UiText weight="semibold" size="sm">{{ ticket.pay.type == 'BANK' ? 'Chuyển Khoản' : 'Tiền Mặt' }}</UiText>
      </UiFlex>
      
      <UiFlex justify="between" class="w-full" v-if="ticket.shift">
        <UiText weight="semibold" color="gray" size="sm">Giá câu</UiText>
        <UiText weight="semibold" size="sm" color="rose">{{ useMoney().toMoney(ticket.shift.price) }} VNĐ</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="lunch">
        <UiText weight="semibold" color="gray" size="sm">Giá cơm</UiText>
        <UiText weight="semibold" size="sm" color="rose">{{ useMoney().toMoney(lunch.price) }} VNĐ</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="green" size="sm">Tổng thanh toán</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.total) }} VNĐ</UiText>
      </UiFlex>

      <UiFlex justify="center" v-if="!!ticket.pay && !!ticket.pay.qrcode && ticket.status == 0">
        <UiImg :src="ticket.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
      </UiFlex>
    </UiFlex>

    <UiFlex class="gap-1 mt-4" justify="end" v-if="ticket.status == 0">
      <UButton color="yellow" @click="paySuccess" :loading="loading" block>Xác Nhận Đã Thanh Toán</UButton>
    </UiFlex>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])
const emits = defineEmits(['close'])

const loading = ref(false)

const statusPay = {
  0: { label: 'Chưa Thanh Toán', color: 'orange' },
  1: { label: 'Đã Thanh Toán', color: 'green' },
}

const lunch = computed(() => {
  if(!props.ticket) return null
  if(!props.ticket.complete) return null
  return props.ticket.lunch
})

const paySuccess = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/pay/success', { code: props.ticket.code })

    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}
</script>