<template>
  <div>
    <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center">Lịch Sử Vé Câu</UiText>
    <UiText color="gray" class="text-base md:text-xl mb-4" align="center">Thông kê các vé câu bạn đã mua</UiText>

    <DataEmpty text="Không tìm thấy thông tin vé câu" :loading="loading" v-if="!!loading || list.length == 0" />

    <UiFlex type="col" class="gap-2" v-else>
      <div class="w-full bg-gray-1000 rounded-2xl p-4 cursor-pointer" v-for="ticket in list" :key="ticket._id" @click="goToTicket(ticket)">
        <UiFlex class="mb-2 gap-4">
          <UiIcon name="i-ion-ticket" size="6" />
          <div class="mr-auto">
            <UiText weight="semibold" size="lg" color="gray">{{ ticket.code }}</UiText>
            <UiText size="sm" color="yellow" v-if="!!ticket.area && !!ticket.spot">{{ ticket.area.name }} - {{ ticket.spot.code }}</UiText>
          </div>
          <UBadge variant="soft" :color="statusTicket[ticket.status]['color']">{{ statusTicket[ticket.status]['label'] }}</UBadge>
        </UiFlex>
        
        <UiFlex justify="between" class="mb-1" v-if="!!ticket.lunch">
          <UiText size="sm" color="gray">Báo cơm</UiText>
          <UiText weight="semibold" size="xs" :color="statusLunch(ticket.lunch)['color']">{{ statusLunch(ticket.lunch)['label'] }}</UiText>
        </UiFlex>

        <UiFlex justify="between" class="mb-1" v-if="!!ticket.shift">
          <UiText size="sm" color="gray">Thời gian câu</UiText>
          <UiFlex class="gap-1">
            <UiText weight="semibold" color="primary">{{ useMoney().toMoney(ticket.shift.duration) }}</UiText>
            <UiText weight="semibold" size="xs">tiếng</UiText> 
          </UiFlex>  
        </UiFlex>

        <UiFlex justify="between" class="mb-1" v-if="!!ticket.price">
          <UiText size="sm" color="gray">Tổng hóa đơn</UiText>
          <UiFlex class="gap-1">
            <UiText weight="semibold" color="green">{{ useMoney().toMoney(ticket.price.total) }}</UiText> 
            <UiText weight="semibold" size="xs">đ</UiText> 
          </UiFlex>  
        </UiFlex>

        <UiFlex justify="between" class="mb-1" v-if="!!ticket.fish">
          <UiText size="sm" color="gray">Số cá câu</UiText>
          <UiFlex class="gap-1">
            <UiText weight="semibold" color="pink">{{ useMoney().toMoney(ticket.fish.amount) }}</UiText> 
            <UiText weight="semibold" size="xs">con</UiText> 
          </UiFlex>
        </UiFlex>

        <UiFlex justify="between" v-if="!!ticket.fish">
          <UiText size="sm" color="gray">Lượng cá câu</UiText>
          <UiFlex class="gap-1">
            <UiText weight="semibold" color="orange">{{ useMoney().toMoney(ticket.fish.kg) }}</UiText> 
            <UiText weight="semibold" size="xs">kg</UiText> 
          </UiFlex>
        </UiFlex>
      </div>

      <UiFlex justify="end" class="w-full">
        <UPagination v-model="page.current" :page-count="page.size" :total="page.total" :max="4" />
      </UiFlex>
    </UiFlex>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'guest'
})

const loading = ref(false)
const list = ref([])

const page = ref({
  size: 10,
  current: 1,
  sort: {
    column: 'createdAt',
    direction: 'desc'
  },
  total: 0
})

const statusTicket = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã thanh toán', color: 'primary' },
  2: { label: 'Đang Câu', color: 'green' },
  3: { label: 'Sắp kết thúc', color: 'purple' },
  4: { label: 'Kết thúc', color: 'red' },
}

const statusLunch = (lunch) => {
  if(lunch.has) return { label: 'Không Đăng Ký', color: 'gray' }
  if(lunch.complete) return { label: 'Chưa Giao', color: 'orange' }
  return { label: 'Đã Giao', color: 'green' }
}

const goToTicket = (ticket) => {
  if(ticket.status == 4) return useNotify().error('Vé đã kết thúc, không thể xem thông tin')
  navigateTo(`/ticket/${ticket.code}`)
}

const getTickets = async () => {
  try {
    loading.value = true

    const data = await useAPI('user/public/tickets', JSON.parse(JSON.stringify(page.value)))

    list.value = data.list
    page.value.total = data.total
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}
getTickets()
</script>