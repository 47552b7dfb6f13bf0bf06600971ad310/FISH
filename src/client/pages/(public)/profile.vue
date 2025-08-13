<template>
  <div>
    <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center">Tài Khoản</UiText>
    <UiText color="gray" class="text-base md:text-xl mb-4" align="center">Chi tiết về thông tin tài khoản</UiText>

    <DataEmpty text="Không tìm thấy thông tin người dùng" :loading="loading" v-if="!!loading || !user" />
    <div v-else>
      <div class="mb-6">
        <UiTitle name="Tài Khoản" icon="i-bxs-user" class="mb-2" />

        <UiFlex type="col" items="start" class="gap-4 bg-gray-1000 rounded-2xl p-4">
          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Họ và Tên</UiText>
            <UiText weight="semibold" size="sm">{{ user.name }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Số điện thoại</UiText>
            <UiText weight="semibold" size="sm">{{ user.phone || '...' }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Email</UiText>
            <UiText weight="semibold" size="sm">{{ user.email || '...' }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full" v-if="!!memberData">
            <UiText weight="semibold" color="gray" size="sm">Hội viên</UiText>
            <UiText weight="semibold" size="sm">{{ memberData.name }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full" v-if="!!memberData && !!memberData.data">
            <UiText weight="semibold" color="gray" size="sm">Hạn hội viên</UiText>
            <UiText weight="semibold" size="sm">{{ useDayJs().displayFull(memberData.data.end) }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full" v-if="!!memberData && !!memberData.data && memberData.data.free">
            <UiText weight="semibold" color="gray" size="sm">Số lần miễn phí cơm</UiText>
            <UiText weight="semibold" size="sm">{{ memberData.data.free.lunch || 0 }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full" v-if="!!memberData && !!memberData.data && memberData.data.free">
            <UiText weight="semibold" color="gray" size="sm">Số giờ câu miễn phí</UiText>
            <UiText weight="semibold" size="sm">{{ memberData.data.free.time || 0 }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full" v-if="!!memberData && !!memberData.data">
            <UiText weight="semibold" color="gray" size="sm">Giảm giá cho hội viên</UiText>
            <UiText weight="semibold" size="sm">{{ memberData.data.discount || 0 }}%</UiText>
          </UiFlex>
        </UiFlex>
      </div>

      <div class="mb-6">
        <UiTitle name="Kinh Tế" icon="i-bxs-coin" class="mb-2" />

        <UiFlex type="col" items="start" class="gap-4 bg-gray-1000 rounded-2xl p-4">
          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Số dự Sen</UiText>
            <UiText weight="semibold" size="sm">{{ useMoney().toMoney(user.currency.coin) }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Số dư Heo</UiText>
            <UiText weight="semibold" size="sm">{{ useMoney().toMoney(user.currency.pig) }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Lượt quay Tuần</UiText>
            <UiText weight="semibold" size="sm">{{ useMoney().toMoney(user.currency.wheel) }}</UiText>
          </UiFlex>
        </UiFlex>
      </div>

      <div>
        <UiTitle name="Thông Số" icon="i-uil-statistics" class="mb-2" />

        <UiFlex type="col" items="start" class="gap-4 bg-gray-1000 rounded-2xl p-4">
          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Đã chi tiêu</UiText>
            <UiText weight="semibold" size="sm">{{ useMoney().toMoney(user.statistic.pay) }}</UiText>
          </UiFlex>

          <UiFlex justify="between" class="w-full">
            <UiText weight="semibold" color="gray" size="sm">Chuỗi móm Cá</UiText>
            <UiText weight="semibold" size="sm">{{ useMoney().toMoney(user.statistic.miss) }}</UiText>
          </UiFlex>
        </UiFlex>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'guest'
})

const loading = ref(false)
const user = ref(null)

const memberData = computed(() => {
  if (!user.value) return null
  const member = user.value.member
  if(!!member.week.enable) return {
    name: 'Tuần',
    data: member.week
  }
  if(!!member.month.enable) return {
    name: 'Tháng',
    data: member.month
  }
  return null
})

const getUser = async () => {
  try {
    loading.value = true

    const data = await useAPI('user/public/profile')

    user.value = data
    loading.value = false
  }
  catch(e){
    loading.value = false
  }
}
getUser()
</script>