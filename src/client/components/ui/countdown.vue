
<template>
  {{ remaining }}
</template>

<script setup>
const props = defineProps(['time'])
const emits = defineEmits(['end'])

const targetTime = new Date(props.time).getTime()
const remaining = ref('')

let interval

const updateCountdown = () => {
  const now = new Date().getTime()
  let diff = targetTime - now

  if (diff < 0) {
    remaining.value = '00:00'
    clearInterval(interval)
    emits('end')
    return
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  minutes = minutes < 10 ? '0'+minutes : minutes
  let seconds = Math.floor((diff % (1000 * 60)) / 1000)
  seconds = seconds < 10 ? '0'+seconds : seconds

  remaining.value = `${minutes}:${seconds}`
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>