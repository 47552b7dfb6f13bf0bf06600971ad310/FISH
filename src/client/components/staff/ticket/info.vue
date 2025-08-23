<template>
  <div v-if="!!area && !!spot && !!ticket">
    <UiFlex type="col" class="gap-4">
      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Số vé</UiText>
        <UiText weight="semibold" size="sm" color="primary">{{ ticket.code }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.time && ticket.time.start">
        <UiText weight="semibold" color="gray" size="sm">Ngày tạo</UiText>
        <UiText weight="semibold" size="sm" color="gray">{{ useDayJs().displayFull(ticket.createdAt) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.time && ticket.time.start">
        <UiText weight="semibold" color="gray" size="sm">Bắt đầu</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useDayJs().displayFull(ticket.time.start) }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full" v-if="!!ticket.time && ticket.time.end">
        <UiText weight="semibold" color="gray" size="sm">Kết thúc</UiText>
        <UiText weight="semibold" size="sm" color="rose">{{ useDayJs().displayFull(ticket.time.end) }}</UiText>
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

    <UiFlex class="mt-8 gap-6 w-full" justify="center">
      <UiText size="sm" align="center" weight="semibold" class="cursor-pointer " color="pink" @click="modal.spot = true" v-if="!!ticket.cancel && !ticket.cancel.status">ĐỔI VỊ TRÍ</UiText>
      <UiText size="sm" align="center" weight="semibold" class="cursor-pointer " color="primary" @click="modal.shift = true">NỐI CA</UiText>
      <UiText size="sm" align="center" weight="semibold" class="cursor-pointer " color="orange" @click="addLunch" v-if="(!!ticket.lunch && !ticket.lunch.has) && (!!ticket.cancel && !ticket.cancel.status)">ĐĂNG KÝ CƠM</UiText>
    </UiFlex>

    <UiFlex class="gap-1 mt-8" justify="center">
      <UButton color="purple" class="grow justify-center" @click="onCancel" :loading="loading">Kết Thúc Sớm</UButton>
      <UButton color="red" class="grow justify-center" @click="onDel" :loading="loading">Hủy Vé Câu</UButton>
    </UiFlex>

    <UModal v-model="modal.spot" prevent-close>
      <UiContent title="Đổi Vị Trí Câu" sub="Bạn chỉ được phép đổi vị trí tối đa 1 lần" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.spot = false"></UButton>
        </template>

        <StaffTicketSpotChange :ticket="ticket" @done="onChangeSpot" />
      </UiContent>
    </UModal>

    <UModal v-model="modal.shift" prevent-close :ui="{width: 'sm:max-w-xs max-w-xs'}">
      <UiContent title="Nối Ca" sub="Thao tác nối ca câu" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.shift = false"></UButton>
        </template>

        <StaffTicketShiftUp :ticket="ticket" @done="onChangeShift" @close="modal.shift = false" />
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])
const emits = defineEmits(['reload', 'change'])

const loading = ref(false)

const modal = ref({
  spot: false,
  shift: false
})

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
  modal.value.spot = false
  emits('change')
}

const onChangeShift = () => {
  modal.value.shift = false
  emits('change')
}

const addLunch = async () => {
  try {
    if(!!loading.value) return

    loading.value = true
    await useAPI('ticket/staff/lunch/add', { code: props.ticket.code })

    loading.value = false
    emits('reload')
  }
  catch(e){
    loading.value = false
  }
}

const onCancel = async () => {
  try {
    if(!!loading.value) return

    loading.value = true
    await useAPI('ticket/staff/cancel', { code: props.ticket.code })

    loading.value = false
    emits('change')
  }
  catch(e){
    loading.value = false
  }
}

const onDel = async () => {
  try {
    if(!!loading.value) return

    loading.value = true
    await useAPI('ticket/staff/del', { code: props.ticket.code })

    loading.value = false
    emits('change')
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