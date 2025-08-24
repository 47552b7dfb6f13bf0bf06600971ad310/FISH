<template>
  <UiFlex type="col" class="p-4">
    <h1 class="text-xl font-bold mb-4">Thông Báo Giọng Nói</h1>
    
    <UButton v-if="!audioUnlocked" @click="unlockAudio">
      Bật Âm Thanh
    </UButton>
    <UiText v-if="!!audioUnlocked" color="green">✅ Đã bật quyền phát âm thanh</UiText>
    <UiText v-if="!!activeWakeLock" color="green">✅ Đã bật quyền sáng màn hình</UiText>

    <UiText class="mt-4">Đang phát: {{ isPlaying ? "Có" : "Không" }}</UiText>
    <UiText>Trong hàng đợi: {{ audioQueue.length }}</UiText>
  </UiFlex>
</template>

<script setup>
import { UiText } from '#components'
import { useWakeLock } from '@vueuse/core'

definePageMeta({
  layout: '',
})

const audioQueue = ref([])
const isPlaying = ref(false)
const audioUnlocked = ref(false)

const wakeLock = reactive(useWakeLock())
const activeWakeLock = computed(() => wakeLock.isActive)

const unlockAudio = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)

  audioUnlocked.value = true
  wakeLock.isActive ? wakeLock.release() : wakeLock.request('screen')
}

const base64ToBlob = (base64, mimeType) => {
  const byteChars = atob(base64)
  const byteNumbers = new Array(byteChars.length)

  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

const playNextAudio = () => {
  if (!audioUnlocked.value) return
  if (isPlaying.value || audioQueue.value.length === 0) return
  isPlaying.value = true

  const base64Audio = audioQueue.value.shift()

  try {
    const audioBlob = base64ToBlob(base64Audio, "audio/mp3")
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.play()

    audio.onended = () => {
      isPlaying.value = false
      playNextAudio()
    }
  } 
  catch (err) {
    isPlaying.value = false
    playNextAudio()
  }
}

const { $socket } = useNuxtApp()
onMounted(() => {
  $socket.on('bot-talk', (data) => {
    audioQueue.value.push(data)
    playNextAudio()
  })
})
</script>