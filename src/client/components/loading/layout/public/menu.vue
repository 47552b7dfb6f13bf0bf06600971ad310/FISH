<template>
  <UiFlex type="col" class="gap-6 p-6">
    <UiFlex class="w-full gap-4" v-for="i in 10" :key="i">
      <USkeleton class="min-w-8 h-8" />
      <USkeleton class="w-full h-8" />
    </UiFlex>
  </UiFlex>
</template>