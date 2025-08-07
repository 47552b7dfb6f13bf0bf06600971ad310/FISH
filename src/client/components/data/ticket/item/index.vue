<template>
  <div>
    <DataEmpty :loading="loading" v-if="!!loading"></DataEmpty>

    <Transition name="page" mode="out-in" v-else>
      <DataTicketItemOrder :ticket="ticket" @done="getOrder" v-if="!order"></DataTicketItemOrder>
      <DataTicketItemPay :ticket="ticket" :order="order" v-else></DataTicketItemPay>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps(['ticket'])
const order = ref()
const loading = ref()

const getOrder = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/public/order/get', { code: props.ticket.code })

    order.value = data
    loading.value = false
  }
  catch (e) {
    loading.value = false
  } 
}

onMounted(() => setTimeout(() => getOrder(), 1))
</script>