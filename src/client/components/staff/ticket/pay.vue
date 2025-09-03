<template>
  <div v-if="!!area && !!spot && !!ticket">
    <UiFlex type="col" class="gap-4">
      <UiFlex justify="between" class="w-full" v-if="!!ticket.pay && !ticket.pay.complete">
        <UiText weight="semibold" color="gray" size="sm">Thanh Toán</UiText>
        <UBadge size="sm" color="red" variant="soft" class="cursor-pointer" @click="changeSuccess">Chưa thanh toán</UBadge>
      </UiFlex>

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

      <UiFlex justify="center" v-if="!!ticket.pay && !!ticket.pay.qrcode && ticket.status == 0 && ticket.pay.type == 'BANK'">
        <UiImg :src="ticket.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
      </UiFlex>
    </UiFlex>

    <UiFlex class="mt-4" type="col gap-1.5" v-if="ticket.status == 0">
      <UFormGroup label="Thời gian vào thực tế" class="w-full">
        <UInput type="datetime-local" v-model="start" />
      </UFormGroup>
      
      <UButton color="yellow" @click="paySuccess(true)" :loading="loading" block>Xác Nhận Đã Thanh Toán</UButton>
      <UButton color="orange" @click="paySuccess(false)" :loading="loading" block>Câu Trước Thanh Toán Sau</UButton>
    </UiFlex>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])
const emits = defineEmits(['reload', 'change'])

const loading = ref(false)

const start = ref(null)

const paySuccess = async (complete) => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/pay/success', { 
      code: props.ticket.code,
      start: start.value,
      complete: complete
    })

    loading.value = false
    emits('reload')
  }
  catch(e){
    loading.value = false
  }
}

const changeSuccess = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/pay/change', { 
      code: props.ticket.code
    })

    loading.value = false
    emits('change')
  }
  catch(e){
    loading.value = false
  }
}

onMounted(() => {
  if(!props.ticket) return null
  if(!props.ticket.time) return null
  if(!props.ticket.time.start) return null

  start.value = props.ticket.time.start
})
</script>