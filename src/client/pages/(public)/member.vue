<template>
  <div class="max-w-[900px] mx-auto @container">
    <div class="grid grid-cols-12 gap-4">
      <UCard 
        class="
          @3xl:col-span-6 col-span-12 
          cursor-pointer select-none 
          overflow-hidden
        "
        :ui="{
          header: { background: `bg-member-${item.type}` },
          divide: 'divide-y-0'
        }" 
        v-for="(item, index) in list" :key="index"
        @click="select(item)"
      >
        <template #header>
          <UiFlex justify="between">
            <UiImg :src="`/images/user/member/${item.type}.webp`" class="w-[60px]" img-size="200px"/>

            <div>
              <UiText align="right" weight="semibold" size="lg">{{  item.title }}</UiText>
              <UiText align="right" size="sm">{{ item.des }}</UiText>
            </div>
          </UiFlex>
        </template>

        <UiText align="center" weight="semibold" :color="item.color" size="3xl" class="mt-6 mb-8">{{ useMoney().toMoney(item.price) }} VNĐ</UiText>

        <UDivider class="mb-4" :ui="{ border: { base: 'border-gray-800' }}">Đặc Quyền</UDivider>

        <UiFlex type="col" items="start" class="gap-1.5">
          <UiFlex v-for="(info, i) in item.info" :key="i" class="gap-2">
            <UiIcon name="i-bxs-star" size="4" :color="info.color" />
            <UiText size="sm" :color="info.color" :weight="!!info.weight ? 'bold' : 'nornal'">{{ info.label }}</UiText>
          </UiFlex>
        </UiFlex>
      </UCard>
    </div>

    <UModal v-model="modal.create" prevent-close>
      <UiContent title="Nâng Hội Viên" sub="Đơn hàng mua thẻ hội viên" no-dot class="bg-card rounded-2xl p-4">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" :disabled="!!loading" square @click="modal.create = false"></UButton>
        </template>

        <UForm>
          <UFormGroup label="Gói hội viên">
            <UInput :model-value="selectMember.title" readonly />
          </UFormGroup>

          <UFormGroup label="Giá nâng">
            <UInput :model-value="useMoney().toMoney(selectMember.price) + ' VNĐ'" readonly />
          </UFormGroup>

          <UiFlex justify="end" class="mt-4">
            <UButton :loading="loading" @click="submit" color="yellow" size="md">Thanh Toán</UButton>
            <UButton :disabled="!!loading" @click="modal.create = false" color="gray" size="md">Đóng</UButton>
          </UiFlex>
        </UForm>
      </UiContent>
    </UModal>

    <UModal v-model="modal.order" prevent-close>
      <UiContent title="Thanh Toán" sub="Vui lòng thanh toán theo hướng dẫn sau" no-dot class="bg-card rounded-2xl p-4">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal.order = false"></UButton>
        </template>

        <UiFlex type="col" v-if="!!order">
          <UiText color="gray" size="sm" align="center">Quyét mã QR dưới đây để thanh toán</UiText>
          
          <div class="mt-4 w-full" v-if="!!configStore.config.gate">
            <UiFlex justify="center" class="mb-6 mt-1" v-if="!!order.qrcode">
              <UiImg :src="order.qrcode" class="w-[200px] md:max-w-[200px]"/>
            </UiFlex>

            <UiFlex justify="between" class="mb-4">
              <div>
                <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Người nhận</UiText>
                <UiText size="sm" weight="semibold">{{ configStore.config.gate.person || '...' }}</UiText>
              </div>
              <UButton color="gray" size="xs" @click="startCopy(configStore.config.gate.person)">Sao chép</UButton>
            </UiFlex>

            <UiFlex justify="between" class="mb-4">
              <div>
                <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Số tài khoản</UiText>
                <UiText size="sm" weight="semibold">{{ configStore.config.gate.number || '...' }}</UiText>
              </div>
              <UButton color="gray" size="xs" @click="startCopy(configStore.config.gate.number)">Sao chép</UButton>
            </UiFlex>

            <UiFlex justify="between" class="mb-4" v-if="!!order.code">
              <div>
                <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Nội dung</UiText>
                <UiText size="sm" weight="semibold">{{ order.code || '...' }}</UiText>
              </div>
              <UButton color="gray" size="xs" @click="startCopy(order.code)">Sao chép</UButton>
            </UiFlex>

            <UiFlex justify="between" v-if="!!order.price">
              <div>
                <UiText size="xs" weight="semibold" color="gray" class="mb-1.5">Số tiền</UiText>
                <UiText size="sm" weight="semibold">{{ useMoney().toMoney(order.price) }}</UiText>
              </div>
              <UButton color="gray" size="xs" @click="startCopy(order.price)">Sao chép</UButton>
            </UiFlex>
          </div>

          <UiFlex type="col" class="gap-1 w-full mt-4">
            <UButton color="green" block size="lg" :loading="successing" :disabled="!!canceling" @click="onSuccess">Tôi Đã Thanh Toán</UButton>
            <UButton color="rose" block size="lg" :loading="canceling" :disabled="!!successing" @click="onCancel">Hủy Giao Dịch</UButton>
          </UiFlex>
        </UiFlex>
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const configStore = useConfigStore()
const authStore = useAuthStore()

const modal = ref({
  create: false,
  order: false
})
const loading = ref(false)
const canceling = ref(false)
const successing = ref(false)

const selectMember = ref(undefined)
const order = ref()

const list = ref([
  {
    title: 'Hội Viên Tuần',
    des: 'Phí gia hạn 7 ngày',
    price: configStore.config.member.week.price,
    info: [
      { label: `Miễn phí ${configStore.config.member.week.free.lunch} lần đăng ký cơm`, color: 'gray' },
      { label: `Miễn phí ${configStore.config.member.week.free.time} giờ câu`, color: 'gray' },
      { label: `Giảm giá thêm ${configStore.config.member.week.discount}% tổng hóa đơn`, color: 'gray' },
      { label: 'Cộng dồn các hoạt động giảm giá khác',color: 'gray'},
      { label: `Thêm ${configStore.config.member.week.wheel} lần quay thưởng mỗi tuần`, color: 'gray'  },
    ],
    type: 'week',
    color: 'sky'
  },
  {
    title: 'Hội Viên Tháng',
    des: 'Phí gia hạn 30 ngày',
    price: configStore.config.member.month.price,
    info: [
      { label: `Miễn phí ${configStore.config.member.month.free.lunch} lần đăng ký cơm`, color: 'gray' },
      { label: `Miễn phí ${configStore.config.member.month.free.time} giờ câu`, color: 'gray' },
      { label: `Giảm giá thêm ${configStore.config.member.month.discount}% tổng hóa đơn`, color: 'gray' },
      { label: 'Cộng dồn các hoạt động giảm giá khác',color: 'gray'},
      { label: `Thêm ${configStore.config.member.month.wheel} lần quay thưởng mỗi tuần`, color: 'gray'  },
    ],
    type: 'month',
    color: 'purple'
  }
])

const select = (member) => {
  if(!authStore.isLogin) return useNotify().error('Vui lòng đăng nhập trước')
  selectMember.value = member
  modal.value.create = true
}

const submit = async () => {
  try {
    loading.value = true
    const data = await useAPI('user/public/member/create', JSON.parse(JSON.stringify(selectMember.value)))

    order.value = data
    loading.value = false
    modal.value.create = false
    modal.value.order = true
  }
  catch (e) {
    loading.value = false
  }
}

const onSuccess = async () => {
  try {
    successing.value = true
    await useAPI('user/public/member/success', { order: order.value.code })

    successing.value = false
    modal.value.order = false
    order.value = null
  }
  catch (e) {
    successing.value = false
  }
}

const onCancel = async () => {
  try {
    canceling.value = true
    await useAPI('user/public/member/cancel', { order: order.value.code })

    canceling.value = false
    modal.value.order = false
    order.value = null
  }
  catch (e) {
    canceling.value = false
  }
}
</script>