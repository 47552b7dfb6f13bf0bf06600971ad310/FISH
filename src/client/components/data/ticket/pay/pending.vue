<template>
  <UiFlex type="col" v-if="!!ticket">
    <UiText class="uppercase text-[1.5rem] md:text-[2rem] mb-1" weight="semibold" align="center">Hệ Thống Thanh Toán</UiText>
    <UiText color="gray" class="text-base md:text-xl" align="center">Vui lòng thanh toán sau</UiText>

    <UiText class="text-[5rem]" weight="semibold" v-if="!!ticket.pay && !!ticket.pay.pending">
      <UiCountdown :time="ticket.pay.pending" @end="onCancel"></UiCountdown>
    </UiText>

    <UiText color="rose" size="sm" align="center">
      Hệ thống sẽ tự động hủy vé khi thời gian kết thúc
    </UiText>

    <UiText color="gray" size="sm" align="center" v-if="!!ticket.pay && ticket.pay.type != 'BANK'">
      Vui lòng đợi nhân viên đến thu tiền hoặc tới quầy để thanh toán
    </UiText>

    <UiText color="gray" size="sm" align="center" v-if="!!ticket.pay && ticket.pay.type == 'BANK'">
      Quyét mã QR dưới đây để thanh toán
    </UiText>
    
    <div v-if="!!configStore.config.gate && !!ticket.pay" class="mt-4 w-full">
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

      <UiFlex justify="between" v-if="!!ticket.total">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Số tiền</UiText>
          <UiText size="sm" weight="bold">{{ useMoney().toMoney(ticket.total) }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(ticket.total)">Sao chép</UButton>
      </UiFlex>
    </div>

    <UButton color="rose" block size="lg" class="mt-4" @click="onCancel">Hủy Vé Câu</UButton>
  </UiFlex>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'
const { copy, isSupported } = useClipboard()

const props = defineProps(['ticket'])

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
    navigateTo('/dat-cho')
  }
  catch(e){
    canceling.value = false
    navigateTo('/dat-cho')
  }
}
</script>