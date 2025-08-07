<template>
  <div class="UiContent">
    <UiFlex class="UiContentHeader gap-4 mb-4">
      <slot name="left"></slot>
      <UiIcon :name="icon" size="8" v-if="!!icon" :color="color" />

      <div class="grow">
        <UiFlex class="gap-4">
          <UiText weight="semibold" :color="color" class="lg:text-lg">{{ title || '...' }}</UiText>
          <slot name="more"></slot>
        </UiFlex>
        
        <UiFlex v-if="!!sub || !!slots['sub']" style="margin-top: -4px;">
          <slot name="sub"></slot>
          <div>
            <UiText class="text-xs lg:text-sm inline" color="gray">{{ !showMore ? sub.slice(0, 100) : sub }}</UiText>
            <UiText class="text-xs lg:text-sm inline" color="gray" v-if="!showMore">...</UiText>
            <UiText class="text-xs lg:text-sm inline cursor-pointer" :color="color" v-if="!!sub && sub.length > 100" @click="showMore = !showMore">{{ !showMore ? 'Xem thêm' : 'Ẩn' }}</UiText>
          </div>
        </UiFlex>
      </div>
    </UiFlex>

    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  sub: String,
  icon: String,
  color: { type: String, default: 'primary' }
})

const slots = useSlots()

const showMore = ref(false)

const checkSub = () => {
  if(!props.sub) return showMore.value = true
  if(props.sub.length > 100) return showMore.value = false
  return showMore.value = true
}
checkSub()
</script>

<style lang="sass">
.UiContent
  .UiContentHeader
    position: relative
    .UiContentDivider
      position: relative
      width: 20%
      max-width: 120px
      height: 0.5px
      border-radius: 50%
      &::after
        content: ''
        position: absolute
        left: 8%
        width: 23px
        height: 9px
        border-radius: 20px
        background: rgb(var(--color-primary-500))
</style>