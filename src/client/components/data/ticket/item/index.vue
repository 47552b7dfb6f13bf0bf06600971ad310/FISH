<template>
  <div>
    <DataEmpty :loading="loading" v-if="!!loading"></DataEmpty>

    <div v-else>
      <DataTicketItemOrder :ticket="ticket" @done="getOrder" v-if="!order"></DataTicketItemOrder>
      <DataTicketItemDelivery :ticket="ticket" :order="order" v-else></DataTicketItemDelivery>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['ticket'])
const order = ref(null)
const loading = ref(true)

const getOrder = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/public/order/get', { code: props.ticket.code })
    
    order.value = data
    loading.value = false
  }
  catch (e) {
    order.value = null
    loading.value = false
  } 
}

onMounted(() => setTimeout(() => getOrder(), 1))
</script>