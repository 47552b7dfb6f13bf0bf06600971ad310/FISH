<template>
  <UiContent title="Thông tin đơn hàng" sub="Đơn hàng gọi dịch vụ ngoài" class="bg-card rounded-2xl p-4">
    <template #more>
      <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="emits('close')"></UButton>
    </template>

    <DataEmpty :loading="loading.load" v-if="!!loading.load || !order" />

    <div v-else>
      <UiFlex type="col" class="bg-gray-1000 p-4 rounded-2xl mb-2 gap-4">
        <UiFlex justify="between" class="w-full">
          <UiText weight="semibold" color="gray" size="sm">Mã Giao Dịch</UiText>
          <UiText weight="semibold" size="sm" color="primary">{{ order.code }}</UiText>
        </UiFlex>

        <UiFlex justify="between" class="w-full">
          <UiText weight="semibold" color="green" size="sm">Tổng thanh toán</UiText>
          <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(order.total) }} VNĐ</UiText>
        </UiFlex>

        <UiFlex justify="between" class="w-full">
          <UiText weight="semibold" color="gray" size="sm">Trạng thái</UiText>
          <UBadge variant="soft" :color="statusOrder[order.status]['color']">{{ statusOrder[order.status]['label'] }}</UBadge>
        </UiFlex>

        <UiFlex justify="center" v-if="!!order.pay && !!order.pay.qrcode && order.status == 0 && pay_type == 'BANK'">
          <UiImg :src="order.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
        </UiFlex>
      </UiFlex>

      <div class="bg-gray-1000 p-4 rounded-2xl">
        <DataEmpty text="Giỏ hàng trống" v-if="!order.cart || order.cart.length == 0"></DataEmpty>

        <UiFlex type="col" class="gap-2" v-else>
          <UiText size="lg" weight="semibold" class="w-full" color="orange">Sản phẩm</UiText>

          <UiFlex class="bg-gray rounded-2xl p-4 md:p-2 gap-4 w-full" v-for="product in order.cart" :key="product._id">
            <UiImg :src="product.item?.image" w="1" h="1" class="bg-gray-1000 rounded-xl max-w-[80px]"/>
            <div>
              <UiText weight="semibold" class="text-base line-clamp-1">{{ product.item?.name }}</UiText>
              <UiText color="gray" class="text-sm line-clamp-1">{{ useMoney().toMoney(product.price) }}</UiText>
              <UButtonGroup size="xs" class="mt-2">
                <UButton color="white" icon="i-bx-minus" square @click="minus(product.item)"></UButton>
                <UButton color="white" disabled>{{ product.amount }}</UButton>
                <UButton color="white" icon="i-bx-plus" square @click="add(product.item)"></UButton>
              </UButtonGroup>
            </div>
          </UiFlex>
        </UiFlex>
      </div>

      <div v-if="order.status == 0" class="mt-2">
        <SelectPayType v-model="pay_type" class="mb-2" />

        <UButton class="mb-0.5" block color="green" @click="onSuccess" :loading="successing">Xác Nhận Đã Giao Và Nhận Tiền</UButton>
        <UButton block color="rose" @click="onCancel" :loading="successing">Hủy Đơn Dịch Vụ</UButton>
      </div>
    </div>
  </UiContent>
</template>

<script setup>
const props = defineProps(['code'])
const emits = defineEmits(['close'])

const order = ref()
const successing = ref(false)
const canceling = ref(false)
const pay_type = ref(null)

const loading = ref({
  load: true,
})

const statusOrder = {
  0: { label: 'Chưa Thanh Toán', color: 'gray' },
  1: { label: 'Đã hoàn thành', color: 'green' },
  2: { label: 'Đã hủy', color: 'red' },
}

const minus = (item) => {
  return 
  if(!order.value) return
  if(!order.value.cart) return
  const cart = order.value.cart
  const index = cart.findLastIndex(i => i.item._id == item._id)
  if(index < 0) return

  order.value.cart[index]['amount'] = order.value.cart[index]['amount'] - 1
  if(order.value.cart[index]['amount'] == 0) order.value.cart.splice(index, 1)
}

const add = (item) => {
  return
  if(!order.value) return
  if(!order.value.cart) return
  const cart = order.value.cart
  const index = cart.findLastIndex(i => i.item._id == item._id)
  if(index < 0) return

  order.value.cart[index]['amount'] = order.value.cart[index]['amount'] + 1
}

const onSuccess = async () => {
  try {
    successing.value = true
    await useAPI('item/staff/order/success', { order: props.code, pay_type: pay_type.value })

    successing.value = false
    getOrder()
  }
  catch (e) {
    successing.value = false
  } 
}

const onCancel = async () => {
  try {
    canceling.value = true
    await useAPI('item/staff/order/cancel', { order: props.code })

    canceling.value = false
    getOrder()
  }
  catch (e) {
    canceling.value = false
  } 
}

const getOrder = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('item/staff/order/view', {
      code: props.code
    })

    loading.value.load = false
    order.value = data
  }
  catch (e) {
    loading.value.load = false
  } 
}

onMounted(() => setTimeout(getOrder, 1))
</script>