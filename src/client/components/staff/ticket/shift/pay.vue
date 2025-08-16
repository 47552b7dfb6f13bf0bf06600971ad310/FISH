<template>
  <UiFlex type="col" v-if="!!ticket && !!connect">
    <UiFlex type="col" class="gap-4 w-full">
      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Mã Giao Dịch</UiText>
        <UiText weight="semibold" size="sm" color="primary">{{ connect.code }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!connect.old">
        <UiText weight="semibold" color="gray" size="sm">Ca cũ</UiText>
        <UiText weight="semibold" size="sm" color="gray">{{ connect.old.duration }}h</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!connect.new">
        <UiText weight="semibold" color="gray" size="sm">Ca mới</UiText>
        <UiText weight="semibold" size="sm" color="gray">{{ connect.new.duration }}h</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="green" size="sm">Tổng thanh toán</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(connect.total) }} VNĐ</UiText>
      </UiFlex>

      <UiFlex justify="center" v-if="!!connect.pay && !!connect.pay.qrcode">
        <UiImg :src="connect.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
      </UiFlex>
    </UiFlex>

    <UiFlex type="col" class="gap-1 w-full mt-4">
      <UButton color="green" block size="lg" :loading="starting" :disabled="!!canceling" @click="onSuccess">Xác Nhận Khách Đã Thanh Toán</UButton>
      <UButton color="rose" block size="lg" :loading="canceling" :disabled="!!starting" @click="onCancel">Hủy Đơn Nối Ca</UButton>
    </UiFlex>
  </UiFlex>
</template>

<script setup>
const props = defineProps(['connect', 'ticket'])
const emits = defineEmits(['cancel', 'done'])

const starting = ref(false)
const canceling = ref(false)

const onCancel = async () => {
  try {
    canceling.value = true
    await useAPI('ticket/staff/shift/up/cancel', { ticket: props.ticket.code, connect: props.connect.code })

    emits('cancel')
    canceling.value = false
  }
  catch(e){
    canceling.value = false
  }
}

const onSuccess = async () => {
  try {
    canceling.value = true
    await useAPI('ticket/staff/shift/up/success', { ticket: props.ticket.code, connect: props.connect.code })

    emits('done')
    canceling.value = false
  }
  catch(e){
    canceling.value = false
  }
}
</script>