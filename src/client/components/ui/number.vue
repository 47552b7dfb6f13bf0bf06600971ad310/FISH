<template>
  <slot :display="displayNumber"></slot>
</template>

<script setup>
const props = defineProps(['num'])

const displayNumber = ref(0)
const duration = 800
const anim = ref()

const totalNum = computed(() => {
  if(!props.num) return 0
  return props.num
})

const run = (from, to) => {
  const startTime = performance.now()

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    displayNumber.value = Math.floor(from + (to - from) * progress)

    if (progress < 1) {
      anim.value = requestAnimationFrame(animate)
    } else {
      displayNumber.value = to
      if(!!anim.value) cancelAnimationFrame(anim.value)
    }
  }

  anim.value = requestAnimationFrame(animate)
}

watch(() => totalNum.value, (val) => {
  run(displayNumber.value, val)
})

onMounted(() => {
  if(totalNum.value > 0) run(0, totalNum.value)
})
onBeforeUnmount(() => {
  if(!!anim.value) cancelAnimationFrame(anim.value)
})
</script>