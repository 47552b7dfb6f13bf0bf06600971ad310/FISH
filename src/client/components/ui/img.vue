<template>
  <div 
    class="relative select-none UiImg"
    :style="`aspect-ratio: ${w} / ${h}`"
    :class="{
      'bg-gray-1000': !!loading,
    }"
  >
    <NuxtImg 
      :src="img(src)" 
      class="object-cover w-full h-full select-none"
      :sizes="props.imgSize"
      :width="props.imgW"
      :height="props.imgH"
      quality="100"
      format="webp"
      :fit="fit"
      :loading="!!preload ? 'eager' : 'lazy'"
      :preload="preload"
      placeholder="/images/placeholder.png"
      :alt="props.alt" 
      @load="onLoad"
    />

    <USkeleton 
      class="absolute top-0 left-0 rounded-none w-full h-full" 
      :style="{
        borderRadius: 'inherit'
      }"
      v-if="!!loading"
    ></USkeleton>
  </div>
</template>

<script setup>
const { img } = useMakeLink()
const props = defineProps({
  src: String,
  imgSize: [ String, Number ],
  fit: { type: String, default: 'cover' },
  imgW: [ String, Number ],
  imgH: [ String, Number ],
  w: [ String, Number ],
  h: [ String, Number ],
  alt: { type: String, default: 'image' },
  preload: { type: Boolean, default: false },
})

const loading = ref(true)
const onLoad = (event) => {
  if(event) loading.value = false
}
</script>

<style lang="sass">
.UiImg
  overflow: hidden
  img
    border-radius: inherit
    aspect-ratio: inherit
</style>