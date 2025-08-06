<template>
  <UiFlex type="col" justify="center" class="p-4">
    <UiImg src="/images/icon/empty.png" w="1" h="1" img-size="300px"  class="w-[120px] h-[120px] mb-2" v-if="!loading" />

    <UiFlex class="mb-3" justify="center" v-else>
      <Loading />
    </UiFlex>

    <UiText color="gray" align="center" size="xs">{{ !!loading ? 'Đang tải' : text }}</UiText>
  </UiFlex>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'i-bx-data'
  },
  text: {
    type: String,
    default: 'Không tìm thấy dữ liệu'
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>