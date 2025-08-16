<template>
  <div v-if="!!area && !!spot && !!ticket">
    <UiFlex type="col" class="gap-4">
      <UiFlex justify="between" class="w-full" v-if="!!ticket.pay">
        <UiText weight="semibold" color="gray" size="sm">Phương thức</UiText>
        <UiText weight="semibold" size="sm">{{ ticket.pay.type == 'BANK' ? 'Chuyển Khoản' : 'Tiền Mặt' }}</UiText>
      </UiFlex>
      
      <UiFlex justify="between" class="w-full" v-if="ticket.price.spot > 0">
        <UiText weight="semibold" color="gray" size="sm">Giá câu</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.price.spot) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="ticket.price.lunch > 0">
        <UiText weight="semibold" color="gray" size="sm">Giá cơm</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.price.lunch) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.discount && !!ticket.discount.time">
        <UiText weight="semibold" color="gray" size="sm">Miễn phí câu hội viên</UiText>
        <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(ticket.price.spot) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.discount && !!ticket.discount.lunch">
        <UiText weight="semibold" color="gray" size="sm">Miễn phí cơm hội viên</UiText>
        <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(ticket.price.lunch) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.discount && ticket.discount.price > 0">
        <UiText weight="semibold" color="gray" size="sm">Giảm giá hội viên</UiText>
        <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(ticket.discount.price) }}%</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.discount && ticket.discount.voucher">
        <UiText weight="semibold" color="gray" size="sm">Giảm giá thẻ Voucher</UiText>
        <UiText weight="semibold" size="sm" color="rose">- {{ ticket.discount.voucher.value }}%</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.discount && ticket.discount.miss">
        <UiText weight="semibold" color="gray" size="sm">Giảm giá móm lần trước</UiText>
        <UiText weight="semibold" size="sm" color="rose">- {{ ticket.discount.miss }}%</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="ticket.price.item > 0">
        <UiText weight="semibold" color="gray" size="sm">Tiền mua dịch vụ</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.price.item) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="ticket.price.pig > 0">
        <UiText weight="semibold" color="gray" size="sm">Tiền đăng ký chơi Heo</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.price.pig) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="ticket.price.connect > 0">
        <UiText weight="semibold" color="gray" size="sm">Giá nối ca</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.price.connect) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="green" size="sm">Tổng hóa đơn</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(ticket.price.total) }} VNĐ</UiText>
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
const emits = defineEmits(['reload'])

const loading = ref(false)

const total = computed(() => {
  if(!props.ticket) return 0
  if(!props.ticket.price) return 0
  if(!props.ticket.discount) return 0

  let total = props.ticket.price.spot + props.ticket.price.lunch
  if(!!props.ticket.discount.time) total = total - props.ticket.price.spot
  if(!!props.ticket.discount.lunch) total = total - props.ticket.price.lunch
  if(props.ticket.discount.price > 0) total = total - Math.floor(total * props.ticket.discount.price / 100)
  
  return total
})

const paySuccess = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/pay/success', { code: props.ticket.code })

    loading.value = false
    emits('reload')
  }
  catch(e){
    loading.value = false
  }
}
</script>