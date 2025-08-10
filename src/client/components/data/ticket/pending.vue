<template>
  <UiFlex type="col" v-if="!!ticket">
    <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center">Hệ Thống Thanh Toán</UiText>
    <!-- <UiText color="gray" class="text-base md:text-xl" align="center">Vui lòng thanh toán sau</UiText> -->

    <UiText class="text-[5rem]" weight="semibold" v-if="!!ticket.pay && !!ticket.time.pay">
      <UiCountdown :time="ticket.time.pay" @end="onCancel"></UiCountdown>
    </UiText>

    <UiText color="rose" size="sm" align="center">
      Hệ thống sẽ tự động hủy vé khi thời gian kết thúc
    </UiText>

    <div class="my-4" v-if="!!ticket.area && !!ticket.spot">
      <UiText size="base" align="center" color="gray">Vị trí ngồi</UiText>
      <UiText size="lg" align="center" weight="semibold" color="yellow">
        {{ ticket.area.name }}, Ô {{ ticket.spot.code }}
      </UiText>
    </div>

    <UiText color="gray" size="sm" align="center" v-if="!!ticket.pay && ticket.pay.type != 'BANK'">
      Vui lòng đợi nhân viên đến thu tiền hoặc tới quầy để thanh toán
    </UiText>

    <UiText color="gray" size="sm" align="center" v-if="!!ticket.pay && ticket.pay.type == 'BANK'">
      Quyét mã QR dưới đây để thanh toán
    </UiText>
    
    <div v-if="!!configStore.config.gate && !!ticket.pay" class="mt-4 w-full md:max-w-[70%] mx-auto">
      <UiFlex justify="center" class="mb-6 mt-1" v-if="!!ticket.pay.qrcode">
        <UiImg :src="ticket.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
      </UiFlex>

      <UiFlex justify="between" class="mb-4">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Người nhận</UiText>
          <UiText size="sm" weight="bold">{{ configStore.config.gate.person || '...' }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(configStore.config.gate.person)">Sao chép</UButton>
      </UiFlex>

      <UiFlex justify="between" class="mb-4">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Số tài khoản</UiText>
          <UiText size="sm" weight="bold">{{ configStore.config.gate.number || '...' }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(configStore.config.gate.number)">Sao chép</UButton>
      </UiFlex>

      <UiFlex justify="between" class="mb-4" v-if="!!ticket.code">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Nội dung</UiText>
          <UiText size="sm" weight="bold">{{ ticket.code || '...' }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(ticket.code)">Sao chép</UButton>
      </UiFlex>

      <UiFlex justify="between" v-if="!!ticket.price && !!ticket.price.total">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Số tiền</UiText>
          <UiText size="sm" weight="bold">{{ useMoney().toMoney(ticket.price.total) }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(ticket.price.total)">Sao chép</UButton>
      </UiFlex>
    </div>

    <UiFlex type="col" class="gap-1 w-full md:max-w-[70%] mx-auto mt-4">
      <UButton color="green" block size="lg" :loading="starting" :disabled="!!canceling" @click="onStart">Tôi Đã Thanh Toán</UButton>
      <UButton color="rose" block size="lg" :loading="canceling" :disabled="!!starting" @click="onCancel">Hủy Vé Câu</UButton>
    </UiFlex>
  </UiFlex>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'
const { copy, isSupported } = useClipboard()

const props = defineProps(['ticket'])
const emits = defineEmits(['start'])

const starting = ref(false)
const canceling = ref(false)

const configStore = useConfigStore()

const startCopy = (text) => {
  if(!isSupported.value || !text) return
  copy(text)
  useNotify().success('Đã sao chép')
}

const onCancel = async () => {
  try {
    canceling.value = true
    await useAPI('ticket/public/cancel', { code: props.ticket.code })

    canceling.value = false
    navigateTo('/create')
  }
  catch(e){
    canceling.value = false
    navigateTo('/create')
  }
}

const onStart = async () => {
  try {
    starting.value = true
    await useAPI('ticket/public/start', { code: props.ticket.code })

    starting.value = false
    emits('start')
  }
  catch(e){
    starting.value = false
  }
}
</script>