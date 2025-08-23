<template>
  <div>
    <UButton color="green" class="w-full justify-center" size="xl" icon="i-mdi-download" @click="action">TẢI ỨNG DỤNG</UButton>

    <UModal v-model="modal" preventClose :ui="{ width: 'sm:max-w-[400px]' }">
      <UiContent title="Tải Ứng Dụng" sub="Chọn hệ điều hành của bạn" class="bg-card rounded-2xl p-4">
        <template #more>
          <UButton icon="i-bx-x" color="gray" class="ml-auto" size="2xs" square @click="modal = false"></UButton>
        </template>

        <UiFlex justify="between" wrap>
          <UiFlex justify="center" class="bg-green-500 cursor-pointer w-[49%] rounded-2xl p-4 gap-2" @click="downloadAndroid()">
            <UiIcon name="i-wpf-android-os" size="8"></UiIcon>
            <UiText weight="semibold" size="lg">Android</UiText>
          </UiFlex>

          <UiFlex justify="center" class="bg-black/70 cursor-pointer w-[49%] rounded-2xl p-4 gap-2" @click="iosPWA = true">
            <UiIcon name="i-mdi-apple" size="8"></UiIcon>
            <UiText weight="semibold" size="lg">Iphone</UiText>
          </UiFlex>
        </UiFlex>
      </UiContent>
    </UModal>

    <UModal v-model="iosPWA" :ui="{ width: 'sm:max-w-[400px]' }">
      <UiContent title="IPhone" sub="Hướng dẫn cài đặt ứng dụng cho IPhone và IPad" class="bg-card rounded-2xl p-4">
          <template #more>
          <UButton icon="i-bx-x" color="gray" class="ml-auto" size="2xs" square @click="iosPWA = false"></UButton>
        </template>

        <UiFlex class="flex gap-1 mb-2" wrap>
          1. Nhấn nút 
          <UiIcon name="i-ion-share-outline" color="yellow" size="5" />
          <strong class="text-yellow-500">Chia sẻ</strong> 
        </UiFlex>

        <UiFlex class="flex gap-1" wrap>
          2. Chọn 
          <UiIcon name="i-icon-park-outline-add" color="yellow" size="5" />
          <strong class="text-yellow-500">Thêm vào Màn hình chính</strong> 
        </UiFlex>
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const configStore = useConfigStore()
const iosPWA = ref(false)
const modal = ref(false)

const action = () => {
  if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) return useNotify('Bạn đã tải ứng dụng rồi')
  modal.value = true
}

const downloadAndroid = async () => {
  if(!!configStore.installPrompt){
    await configStore.installPrompt.prompt()
    configStore.setInstallPrompt(null)
    return
  }
  else {
    useNotify().error('Trình duyệt của bạn không hỗ trợ')
  }
}

</script>