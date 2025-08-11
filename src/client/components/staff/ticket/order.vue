<template>
  <DataEmpty class="min-h-[300px]" text="Không có đơn hàng nào đang xử lý" :loading="loading" v-if="!!loading" />

  <div v-else>
    <StaffOrderPending :ticket="ticket" :order="order" @done="getOrder" v-if="!!order" />
    <StaffOrderList :ticket="ticket" :list="list" v-else />
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])

const order = ref(null)
const list = ref([])
const loading = ref(true)

const getOrder = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/order/get', { code: props.ticket.code })

    order.value = data.order
    list.value = data.list
    loading.value = false
  }
  catch (e) {
    order.value = null
    loading.value = false
  } 
}

onMounted(() => setTimeout(() => getOrder(), 1))
</script>