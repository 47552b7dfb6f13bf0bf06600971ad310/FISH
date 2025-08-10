<template>
  <div class="w-full py-4 px-6">
    <UiFlex type="col" v-for="(item, index) in menu" :key="`m-${index}`">
      <UiFlex 
        v-if="!item.child" 
        class="MenuItem gap-4 text-gray-500 rounded-2xl" 
        @click="goTo(item.to)"
        :class="{
          'MenuItem--Active': item.to == activeTo
        }"
      >
        <UiIcon class="MenuItem__Icon" :name="item.icon" size="6" />
        <UiText class="MenuItem__Text" size="sm" weight="semibold">{{ item.title }}</UiText>
      </UiFlex>

      <div class="w-full my-2" v-else>
        <UiText size="xs" weight="bold" class="mb-4">{{ item.title }}</UiText>
        <UiFlex 
          v-for="(child, cIndex) in item.child" :key="`c-${index}-${cIndex}`" 
          class="MenuItem gap-4 text-gray-500 rounded-2xl" 
          @click="goTo(child.to)"
          :class="{
            'MenuItem--Active': child.to == activeTo
          }"
        >
          <UiIcon class="MenuItem__Icon" :name="child.icon" size="6" />
          <UiText class="MenuItem__Text" size="sm" weight="semibold">{{ child.title }}</UiText>
        </UiFlex>
      </div>
    </UiFlex>
  </div>
</template>

<script setup>
const route = useRoute()
const emit = defineEmits(['to'])
const menu = ref([
  { title: 'Cài đặt', child: [
    { title: 'Thông tin hồ', icon: 'i-ix-about-filled', to: `/manage/config/info` },
    { title: 'Giá và khuyến mãi', icon: 'i-solar-tag-price-bold', to: `/manage/config/price` },
    { title: 'Kênh thanh toán', icon: 'i-mynaui-bank-solid', to: `/manage/config/gate` },
    { title: 'Thời gian câu', icon: 'i-bxs-time', to: `/manage/config/shift` },
    { title: 'Cấu hình Hội viên', icon: 'i-bxs-group', to: `/manage/config/member` }
  ]},
  { title: 'Tài khoản', child: [
    { title: 'Danh sách', icon: 'i-bx-group', to: `/manage/user` },
    { title: 'Hội viên', icon: 'i-bxs-group', to: `/manage/user/member` },
  ]},
  { title: 'Quản lý hồ', child: [
    { title: 'Khu vực', icon: 'i-ph-map-pin-simple-area-bold', to: `/manage/lake/area` },
    { title: 'Ô câu', icon: 'i-streamline-select-circle-area-1-solid', to: `/manage/lake/spot` },
  ]},
  { title: 'Quản lý cá', child: [
    { title: 'Loại cá', icon: 'i-mdi-fish', to: `/manage/fish/category` },
    { title: 'Danh sách', icon: 'i-mdi-list-box', to: `/manage/fish` },
  ]},
  { title: 'Dịch vụ thêm', child: [
    { title: 'Loại sản phẩm', icon: 'i-mdi-food', to: `/manage/item/category` },
    { title: 'Danh sách', icon: 'i-mdi-list-box', to: `/manage/item` },
  ]},
  { title: 'Thẻ Voucher', child: [
    { title: 'Danh sách', icon: 'i-mdi-voucher', to: `/manage/voucher` },
    { title: 'Lịch sử', icon: 'i-bx-time', to: `/manage/voucher/history` },
  ]}
])

const activeTo = computed(() => {
  return route.path
})

const goTo = (link) => {
  if(link == activeTo.value) return
  navigateTo(link)
  emit('to')
}
</script>