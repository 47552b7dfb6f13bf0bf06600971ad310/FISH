
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

  const totalSeconds = Math.floor(diff / 1000)
  let hours = Math.floor(diff / (1000 * 60 * 60))
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  minutes = minutes < 10 ? '0'+minutes : minutes
  let seconds = Math.floor((diff % (1000 * 60)) / 1000)
  seconds = seconds < 10 ? '0'+seconds : seconds

  if (hours > 0) {
    hours = hours < 10 ? '0'+hours : hours
    remaining.value = `${hours}:${minutes}:${seconds}`
  } else {
    remaining.value = `${minutes}:${seconds}`
  }
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>