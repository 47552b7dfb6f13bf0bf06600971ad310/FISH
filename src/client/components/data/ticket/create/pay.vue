<template>
  <div>
    <div class="mb-4">
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline" color="green">Bước 1</UBadge>
        <UiText>Chọn khu vực hồ</UiText>

        <UButton class="ml-auto" color="gray" size="xs" @click="emits('back', 1)">Chọn lại</UButton>
      </UiFlex>
    </div>

    <div class="mb-4">
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline" color="green">Bước 2</UBadge>
        <UiText>Chọn ô câu</UiText>

        <UButton class="ml-auto" color="gray" size="xs" @click="emits('back', 2)">Chọn lại</UButton>
      </UiFlex>
    </div>

    <div>
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline">Bước 3</UBadge>
        <UiText>Xác nhận dịch vụ</UiText>
      </UiFlex>

      <UForm :validate="validate" :state="state" @submit="submit">
        <UFormGroup label="Tên khách hàng" name="name">
          <UInput icon="i-bxs-user" v-model="state.name" :disabled="!!authStore.isLogin" />
        </UFormGroup>

        <UFormGroup label="Số điện thoại" name="phone">
          <UInput icon="i-bxs-phone" v-model="state.phone" :disabled="!!authStore.isLogin" />
        </UFormGroup>

        <UFormGroup label="Thẻ khuyến mãi" v-if="!!authStore.isLogin">
          <SelectVoucher v-model="state.voucher" v-model:voucherData="voucher" :type="['DISCOUNT', 'DISCOUNT-PRICE']" />
        </UFormGroup>

        <UFormGroup label="Bạn có chơi Heo không" v-if="!!area && !!area.pig && !!area.pig.max > 0">
          <USelectMenu v-model="state.pig" size="lg" value-attribute="value" :options="[
            { label: 'Có', value: true },
            { label: 'Không', value: false }
          ]">
            <template #label>
              <span v-if="state.pig === undefined">Lựa chọn</span>
              <span v-else>{{ state.pig ? 'Có' : 'Không' }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup label="Thông tin đơn hàng">
          <UiFlex type="col" class="mt-4 gap-4 relative bg-gray-1000 p-4 rounded-2xl">
            <UiFlex justify="between" class="w-full">
              <UiText weight="semibold" color="gray" size="sm">Khu vực</UiText>
              <UiText weight="semibold" size="sm">{{ area.name }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full">
              <UiText weight="semibold" color="gray" size="sm">Ô câu</UiText>
              <UiText weight="semibold" size="sm">{{ spot.code }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full">
              <UiText weight="semibold" color="gray" size="sm">Thời gian</UiText>
              <UiText weight="semibold" size="sm">{{ shift.duration }} tiếng</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full">
              <UiText weight="semibold" color="gray" size="sm">Giá câu</UiText>
              <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(shift.price) }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="!!props.lunch">
              <UiText weight="semibold" color="gray" size="sm">Phí cơm</UiText>
              <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(configStore.config.lunch.price) }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="!!area && !!area.pig && !!area.pig.max > 0 && !!state.pig">
              <UiText weight="semibold" color="gray" size="sm">Đăng ký chơi Heo</UiText>
              <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(area.pig.max) }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="!!discountTime">
              <UiText weight="semibold" color="gray" size="sm">Miễn phí câu hội viên</UiText>
              <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(shift.price) }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="!!discountLunch">
              <UiText weight="semibold" color="gray" size="sm">Miễn phí cơm hội viên</UiText>
              <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(configStore.config.lunch.price) }}</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="discountPrice > 0">
              <UiText weight="semibold" color="gray" size="sm">Giảm giá hội viên</UiText>
              <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(discountPrice) }}%</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="discountVoucher > 0">
              <UiText weight="semibold" color="gray" size="sm">Giảm giá thẻ Voucher</UiText>
              <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(discountVoucher) }}%</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="discountMiss > 0">
              <UiText weight="semibold" color="gray" size="sm">Giảm giá móm lần trước</UiText>
              <UiText weight="semibold" size="sm" color="rose">- {{ useMoney().toMoney(discountMiss) }}%</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full">
              <UiText weight="semibold" color="green" size="xl">Tổng</UiText>
              <UiText weight="semibold" size="xl" color="green">{{ useMoney().toMoney(totalPrice) }} VNĐ</UiText>
            </UiFlex>
          </UiFlex>
        </UFormGroup>

        <UButton type="submit" :loading="loading" color="yellow" block size="lg">Xác Nhận Thanh Toán</UButton>
      </UForm>
    </div>

    <UModal v-model="modal" preventClose :ui="{width: 'max-w-[300px] sm:max-w-[300px]'}">
      <LoadingTable text="Vui lòng đợi..." v-if="!!loading" />

      <UiContent title="Thanh Toán" sub="Vui lòng chọn phương thức thanh toán" class="bg-card rounded-2xl p-4">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="modal = false"></UButton>
        </template>

        <UiFlex class="bg-gray cursor-pointer w-full rounded-2xl p-4 gap-2 mb-1" @click="create('MONEY')">
          <UiText weight="semibold" size="lg" class="mr-auto">Tiền Mặt</UiText>
          <UiIcon name="i-bx-money" size="8"></UiIcon>
        </UiFlex>

        <UiFlex class="bg-gray cursor-pointer w-full rounded-2xl p-4 gap-2 mb-1" @click="create('BANK')">
          <UiText weight="semibold" size="lg" class="mr-auto">Chuyển khoản</UiText>
          <UiIcon name="i-bxs-credit-card" size="8"></UiIcon>
        </UiFlex>
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const configStore = useConfigStore()
const authStore = useAuthStore()
const props = defineProps(['area', 'spot', 'shift', 'lunch'])
const emits = defineEmits(['back'])

const modal = ref(false)

const state = ref({
  name: authStore.isLogin ? authStore.profile.name : undefined,
  phone: authStore.isLogin ? authStore.profile.phone : undefined,
  area: props.area._id,
  spot: props.spot._id,
  shift: props.shift._id,
  lunch: props.lunch,
  pig: true,
  pay_type: null,
  voucher: null
})

const voucher = ref()

const loading = ref(false)

const validate = (state) => {
  const errors = []
  if (!state.name && !authStore.isLogin) errors.push({ path: 'name', message: 'Vui lòng nhập đầy đủ' })
  if (!state.phone && !authStore.isLogin) errors.push({ path: 'phone', message: 'Vui lòng nhập đầy đủ' })
  else if (!state.phone.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g) && !authStore.isLogin) errors.push({ path: 'phone', message: 'Định dạng không đúng' })
  return errors
}

const discountTime = computed(() => {
  if(!authStore.isLogin) return false
  if(!props.shift) return false
  if(!props.shift.duration) return false

  const member = authStore.getMember()
  if(!member) return false

  const free = member.free.time
  if(free > props.shift.duration) return true
  return false
})

const discountLunch = computed(() => {
  if(!authStore.isLogin) return false
  if(!props.lunch) return false

  const member = authStore.getMember()
  if(!member) return false

  const free = member.free.lunch
  if(free > 0) return true
  return false
})

const discountPrice = computed(() => {
  if(!authStore.isLogin) return 0
  const member = authStore.getMember()
  if(!member) return 0
  const type = authStore.getMemberType()
  if(!type) return 0
  return configStore.config.member[type].discount || 0
})

const discountVoucher = computed(() => {
  if(!authStore.isLogin) return 0
  if(!state.value.voucher) return 0
  if(!voucher.value) return 0
  if(!voucher.value.value) return 0
  
  return voucher.value.value
})

const discountMiss = computed(() => {
  if(!authStore.isLogin) return 0
  if(!authStore.profile) return 0
  if(!authStore.profile.statistic) return 0
  if(!authStore.profile.statistic.miss) return 0
  if(!configStore.config.miss) return 0
  const maxKey = Math.max(...Object.keys(configStore.config.miss).map(Number));
  const key = authStore.profile.statistic.miss >= maxKey ? maxKey : authStore.profile.statistic.miss
  const value = configStore.config.miss[key]
  if(!value) return 0
  return value
})

const totalPrice = computed(() => {
  if(!props.area) return 0
  if(!props.area.pig) return 0
  if(!props.shift) return 0
  if(!props.shift.duration) return 0
  
  const shift = props.shift.price
  const lunch = !!props.lunch ? configStore.config.lunch.price : 0
  const pig = props.area.pig.max > 0 && !!state.value.pig ? props.area.pig.max : 0
  let total = shift + lunch
  if(!!discountTime.value) total = total - shift
  if(!!discountLunch.value) total = total - configStore.config.lunch.price

  const discountPriceValue = discountPrice.value
  const discountVoucherValue = discountVoucher.value
  const discountMissValue = discountMiss.value
  let discount = discountPriceValue + discountVoucherValue + discountMissValue
  discount = discount > 100 ? 100 : discount
  if(discount > 0) total = total - Math.floor(total * discount / 100)
  return total + pig
})

const submit = async () => {
  if(totalPrice.value == 0) return await create('BANK')
  return modal.value = true
}

const create = async (pay_type) => {
  try {
    loading.value = true
    state.value.pay_type = pay_type
    const code = await useAPI('ticket/public/create', JSON.parse(JSON.stringify(state.value)))
    navigateTo(`/ticket/${code}`)
  }
  catch(e){
    loading.value = false
  }
}

onMounted(async () => {
  await authStore.setAuth()
})

watch(() => authStore.isLogin, (val) => !val && navigateTo('/'))
</script>
