<template>
  <div>
    <div class="mb-4">
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline" color="green">Bước 1</UBadge>
        <UiText>Chọn khu vực hồ</UiText>

        <UButton class="ml-auto" color="gray" size="xs" @click="emits('back', 1)">Chọn lại</UButton>
      </UiFlex>

      <UAlert :title="area.name" :description="area.description" icon="i-bx-check" color="green" variant="soft"></UAlert>
    </div>

    <div class="mb-4">
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline" color="green">Bước 2</UBadge>
        <UiText>Chọn ô câu</UiText>

        <UButton class="ml-auto" color="gray" size="xs" @click="emits('back', 2)">Chọn lại</UButton>
      </UiFlex>

      <UAlert 
        :title="`Ô số ${spot.code}`" 
        icon="i-bx-check" 
        color="green" 
        variant="soft"
      >
        <template #description>
          <UiText><b class="text-rose-500">{{ shift.name }}</b> với giá <b class="text-rose-500">{{ `${useMoney().toMoney(shift.price)} VNĐ` }}</b></UiText>
          <UiText v-if="!!lunch" class="mt-1">Có đăng ký cơm với giá <b class="text-rose-500">{{ ` ${useMoney().toMoney(configStore.config.lunch.price)} VNĐ` }}</b></UiText>
        </template>
      </UAlert>
    </div>

    <div>
      <UiFlex class="gap-2 mb-4">
        <UBadge variant="outline">Bước 3</UBadge>
        <UiText>Xác nhận dịch vụ</UiText>
      </UiFlex>

      <UForm :validate="validate" :state="state" @submit="submit">
        <UFormGroup label="Tên khách hàng" name="name">
          <UInput icon="i-bxs-user" v-model="state.name" :readonly="!!authStore.isLogin" />
        </UFormGroup>

        <UFormGroup label="Số điện thoại" name="phone">
          <UInput icon="i-bxs-phone" v-model="state.phone" :readonly="!!authStore.isLogin" />
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
              <UiText weight="semibold" size="sm" color="rose">{{ useMoney().toMoney(shift.price) }} VNĐ</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full" v-if="!!props.lunch">
              <UiText weight="semibold" color="gray" size="sm">Phí cơm</UiText>
              <UiText weight="semibold" size="sm" color="rose">{{ useMoney().toMoney(configStore.config.lunch.price) }} VNĐ</UiText>
            </UiFlex>

            <UiFlex justify="between" class="w-full">
              <UiText weight="semibold" color="green" size="xl">Tổng</UiText>
              <UiText weight="semibold" size="xl" color="green">{{ useMoney().toMoney((!!props.lunch ? configStore.config.lunch.price : 0) + shift.price) }} VNĐ</UiText>
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
  pay_type: null
})

const loading = ref(false)

const validate = (state) => {
  const errors = []
  if (!state.name && !authStore.isLogin) errors.push({ path: 'name', message: 'Vui lòng nhập đầy đủ' })
  if (!state.phone && !authStore.isLogin) errors.push({ path: 'phone', message: 'Vui lòng nhập đầy đủ' })
  else if (!state.phone.match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g) && !authStore.isLogin) errors.push({ path: 'phone', message: 'Định dạng không đúng' })
  return errors
}

const submit = async () => {
  try {
    if(!!authStore.isLogin) return modal.value = true

    loading.value = true
    await useAPI('user/public/sign/fast', JSON.parse(JSON.stringify(state.value)))
    
    await authStore.setAuth()
    loading.value = false
    modal.value = true
  }
  catch (e) {
    loading.value = false
  }
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
    if(e == 'Vui lòng chọn ô khác, ô này đang có người đặt') navigateTo('/')
  }
}
</script>
