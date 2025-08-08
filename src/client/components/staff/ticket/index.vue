<template>
  <div v-if="!!area && !!spot && !!ticket">
    <div class="mb-4" v-if="!!ticket.end">
      <UiText class="uppercase" size="lg" weight="semibold" align="center" color="gray">Thời Gian Còn Lại</UiText>
      <UiText class="text-[4rem]" weight="semibold" align="center" >
        <UiCountdown :time="ticket.end"></UiCountdown>
      </UiText>
    </div>

    <UiFlex type="col" class="gap-4">
      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Số vé</UiText>
        <UiText weight="semibold" size="sm" color="primary">{{ ticket.code }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Người thuê</UiText>
        <UiText weight="semibold" size="sm">{{ ticket.user?.name }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Số điện thoại</UiText>
        <UiText weight="semibold" size="sm">{{ ticket.user?.phone }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!statusLunch">
        <UiText weight="semibold" color="gray" size="sm">Trang thái cơm</UiText>
        <UBadge class="cursor-pointer" variant="soft" :color="statusLunch['color']" @click="successLunch">{{ statusLunch['label'] }}</UBadge>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Trạng thái vé</UiText>
        <UBadge variant="soft" :color="statusTicket[ticket.status]['color']">{{ statusTicket[ticket.status]['label'] }}</UBadge>
      </UiFlex>
    </UiFlex>

    <UiFlex class="gap-1 mt-4" justify="end">
      <UButton color="red" @click="onCancel" :loading="loading" block>Hủy Vé Câu</UButton>
    </UiFlex>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])

const loading = ref(false)

const statusTicket = {
  0: { label: 'Chưa Thanh Toán', color: 'orange' },
  1: { label: 'Đang Câu', color: 'green' },
}

const statusLunch = computed(() => {
  if(!props.ticket) return null
  if(!props.ticket.complete) return null
  if(!props.ticket.lunch) return null

  if(!props.ticket.lunch.has) return { label: 'Không Đăng Ký', color: 'gray' }
  if(!props.ticket.complete.lunch) return { label: 'Chưa Giao', color: 'orange' }
  return { label: 'Đã Giao', color: 'green' }
})

const onCancel = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/cancel', { code: props.ticket.code })

    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}

const successLunch = async () => {
  try {
    await useAPI('ticket/staff/lunch/action', { code: props.ticket.code })
  }
  catch (e) {
  }
}
</script>