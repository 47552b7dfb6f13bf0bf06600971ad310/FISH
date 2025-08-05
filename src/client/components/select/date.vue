<template>
  <div>
    <VCalendarDatePicker
      v-model="date"
      transparent
      borderless
      :mode="mode"
      :color="appConfig.ui.primary"
      :is-dark="isDark"
    >
      <template #default="{ togglePopover }">
        <UiFlex class="relative">
          <UInput 
            class="grow"
            readonly
            :model-value="show" 
            @click="togglePopover" 
            :placeholder="props.placeholder || 'Chọn thời gian'"
            :size="size"
          />
          <UIcon 
            v-if="!!props.modelValue"
            name="i-bx-x" 
            color="gray" 
            pointer 
            class="absolute right-2"
            @click="emit('update:modelValue', null)" 
          />
        </UiFlex>
      </template>
    </VCalendarDatePicker>
  </div>
</template>

<script setup>
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import 'v-calendar/dist/style.css'

const { displayFull, displayDay } = useDayJs()

const props = defineProps({ 
  modelValue: Date,
  time: Boolean,
  placeholder: String,
  size: String
})
const emit = defineEmits(['update:modelValue'])

const appConfig = useAppConfig()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value == 'dark')

const mode = computed(() => !!props.time ? 'dateTime' : 'date')

const date = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const show = computed(() => {
  if(!date.value) return null
  if(!!props.time) return displayFull(date.value)
  else return displayDay(date.value)
})
</script>

<style lang="sass">
.vc-date-picker-content
  background: #fff
  border-radius: 12px
  border-color: rgb(var(--color-gray-300))
.dark
  .vc-date-picker-content
    background: rgb(var(--color-gray-900))
    border-color: rgb(var(--color-gray-700))
</style>