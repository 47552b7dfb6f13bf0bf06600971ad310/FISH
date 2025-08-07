<template>
  <DataTicketCreate />
</template>

<script setup>
const authStore = useAuthStore()

const checkTicket = async () => {
  try {
    const data = await useAPI('ticket/public/check')
    if(!!data) navigateTo(`ticket/${data}`)
  }
  catch(e){
  }
}

watch(() => authStore.isLogin, (val) => !!val && checkTicket())
</script>