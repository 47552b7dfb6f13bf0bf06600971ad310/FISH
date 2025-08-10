<template>
  <DataEmpty :text="err" :loading="loading" v-if="!!loading || !ticket" class="min-h-[400px]" />

  <div v-else>
    <DataTicketPending :ticket="ticket" v-if="ticket.status == 0" @start="getTicket" />
    <DataTicket :ticket="ticket" @reload="getTicket" v-else />
  </div>
</template>

<script setup>
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const ticket = ref()
const err = ref('Không tìm thấy thông tin vé câu')

const getTicket = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/public/code', { code: route.params.code })

    ticket.value = data
    loading.value = false
  }
  catch(e){
    loading.value = false
    err.value = e.toString()
  }
}

getTicket()

watch(() => authStore.isLogin, (val) => navigateTo('/'))
</script>