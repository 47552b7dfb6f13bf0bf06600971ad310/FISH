<template>
  <div v-if="!!ticket">
    <DataTicketPayPending :ticket="ticket" v-if="!!ticket.complete && !!ticket.complete.pay && !ticket.complete.pay.pending" />
  </div>
</template>

<script setup>
const route = useRoute()

const loading = ref(true)
const ticket = ref()

const getTicket = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/public/code', { code: route.params.code })

    ticket.value = data
    loading.value = false
  }
  catch(e){
    return false
  }
}

getTicket()
</script>