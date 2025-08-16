<template>
  <UiFlex type="col" v-if="!!ticket && !!connect">
    <UiText color="gray" size="sm" align="center" v-if="!!connect.pay && connect.pay.type != 'BANK'">
      Vui lòng đợi nhân viên đến thu tiền hoặc tới quầy để thanh toán
    </UiText>

    <UiText color="gray" size="sm" align="center" v-if="!!connect.pay && connect.pay.type == 'BANK'">
      Quyét mã QR dưới đây để thanh toán
    </UiText>
    
    <div v-if="!!configStore.config.gate && !!connect.pay" class="mt-4 w-full">
      <UiFlex justify="center" class="mb-6 mt-1" v-if="!!connect.pay.qrcode">
        <UiImg :src="connect.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
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

      <UiFlex justify="between" class="mb-4" v-if="!!connect.code">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Nội dung</UiText>
          <UiText size="sm" weight="bold">{{ connect.code || '...' }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(connect.code)">Sao chép</UButton>
      </UiFlex>

      <UiFlex justify="between" v-if="!!connect.total">
        <div>
          <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Số tiền</UiText>
          <UiText size="sm" weight="bold">{{ useMoney().toMoney(connect.total) }}</UiText>
        </div>
        <UButton color="gray" size="xs" @click="startCopy(connect.total)">Sao chép</UButton>
      </UiFlex>
    </div>

    <UiFlex type="col" class="gap-1 w-full mt-4">
      <UButton color="rose" block size="lg" :loading="canceling" :disabled="!!starting" @click="onCancel">Hủy Đơn Nối Ca</UButton>
    </UiFlex>
  </UiFlex>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'
const { copy, isSupported } = useClipboard()

const props = defineProps(['connect', 'ticket'])
const emits = defineEmits(['cancel'])

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
    await useAPI('ticket/public/shift/up/cancel', { ticket: props.ticket.code, connect: props.connect.code })

    emits('cancel')
    canceling.value = false
  }
  catch(e){
    emits('cancel')
    canceling.value = false
  }
}
</script>