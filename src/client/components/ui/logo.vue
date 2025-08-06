<template>
  <UiFlex class="select-none">
    <img :src="configStore.config.image.logo" :style="{ height: `${imgSize}px` }" v-if="!!configStore.config.image.logo" />
    
    <UiText weight="bold" size="2xl" color="primary" class="italic" v-else>
      {{nameArr.fristWord}}<span class="text-white text-base">{{nameArr.ensWord}}</span>
    </UiText>
  </UiFlex>
</template>

<script setup>
const configStore = useConfigStore()

const props = defineProps({
  imgSize: { type: [ Number, String ], default: 35 }
})

const nameArr = computed(() => {
  const sentence = configStore.config.name
  if(!sentence) return { fristWord: "ENI", ensWord: "Studio" }

  const words = sentence.split(" ")
  if(words.length === 1) return { fristWord: words[0], ensWord: "" }

  const fristWord = words[0]
  const filteredWords = words.filter(word => word !== fristWord)
  const ensWord = filteredWords.join("")
  return { fristWord, ensWord }
})
</script>