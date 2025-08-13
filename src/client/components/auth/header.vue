<template>
  <UiFlex class="gap-1">
    <UPopover :ui="{wrapper: 'inline-flex'}" :popper="{ strategy: 'absolute', placement: 'bottom-end' }" v-model:open="open">
      <UButton icon="i-bx-user" color="gray" size="xs">
        {{ authStore.profile.name }}
      </UButton>

      <template #panel>
        <div class="bg-gray-1000 w-[220px] max-w-sreen p-2">
          <UiFlex
            v-for="(item, index) in menuUser" :key="index"
            class="MenuItem gap-2 text-gray-500 rounded-2xl"
            @click="item.click()"
          >
            <UiIcon class="MenuItem__Icon" :name="item.icon" size="6" />
            <UiText class="MenuItem__Text" size="sm" weight="semibold" color="gray">{{ item.label }}</UiText>
          </UiFlex>
        </div>
      </template>
    </UPopover>
  </UiFlex>
</template>

<script setup>
const authStore = useAuthStore()

const open = ref(false)

const menuUser = computed(() => {
  const list = []

  if(!!authStore.profile.type > 0){
    list.push({
      label: 'Quản trị viên',
      icon: 'i-bx-shield-quarter',
      click: () => navigateTo('/manage/config/info')
    })
    list.push({
      label: 'Nhân viên',
      icon: 'i-wpf-administrator',
      click: () => navigateTo('/staff')
    })
  }

  return [
    ...list,
    {
      label: 'Thông tin',
      icon: 'i-bx-user',
      click: () => navigateTo('/profile')
    },{
      label: 'Lịch sử câu',
      icon: 'i-bx-credit-card',
      click: () => navigateTo('/tickets')
    },{
      label: 'Đăng xuất',
      icon: 'i-bx-log-out',
      click: async () => {
        await authStore.removeAuth()
      }
    }
  ]
})
</script>