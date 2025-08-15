<template>
  <div v-if="!!area && !!spot && !!ticket">
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

    <!-- <UiFlex class="gap-1 mt-4" justify="end">
      <UButton color="red" @click="onCancel" :loading="loading" block>Hủy Vé Câu</UButton>
    </UiFlex> -->

    <UiText size="sm" align="center" weight="semibold" class="cursor-pointer mt-4" color="rose" @click="modal = true">ĐỔI VỊ TRÍ</UiText>

    <UModal v-model="modal" prevent-close>
      <UiContent title="Đổi Vị Trí Câu" sub="Bạn chỉ được phép đổi vị trí tối đa 1 lần" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal = false"></UButton>
        </template>

        <StaffTicketSpotChange :ticket="ticket" @done="onChangeSpot" />
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])
const emits = defineEmits(['reload', 'change'])

const loading = ref(false)

const modal = ref(false)

const statusTicket = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã thanh toán', color: 'primary' },
  2: { label: 'Đang Câu', color: 'green' },
  3: { label: 'Sắp kết thúc', color: 'purple' },
  4: { label: 'Kết thúc', color: 'red' },
}


const statusLunch = computed(() => {
  if(!props.ticket) return null
  if(!props.ticket.lunch) return null

  if(!props.ticket.lunch.has) return { label: 'Không Đăng Ký', color: 'gray' }
  if(!props.ticket.lunch.complete) return { label: 'Chưa Giao', color: 'orange' }
  return { label: 'Đã Giao', color: 'green' }
})

const onChangeSpot = () => {
  modal.value = false
  emits('change')
}

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
    emits('reload')
  }
  catch (e) {
  }
}
</script>