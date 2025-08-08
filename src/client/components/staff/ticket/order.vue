<template>
  <DataEmpty class="min-h-[300px]" text="Không có đơn hàng nào đang xử lý" :loading="loading" v-if="!!loading || !order" />

  <div v-if="order">
    <UiFlex type="col" class="bg-gray-1000 p-4 rounded-2xl mb-2 gap-4">
      <UiText size="lg" weight="semibold" class="w-full" color="orange">Đơn hàng đang đợi xử lý...</UiText>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="gray" size="sm">Mã Giao Dịch</UiText>
        <UiText weight="semibold" size="sm" color="primary">{{ order.code }}</UiText>
      </UiFlex>

      <UiFlex justify="between" class="w-full">
        <UiText weight="semibold" color="green" size="sm">Tổng thanh toán</UiText>
        <UiText weight="semibold" size="sm" color="green">{{ useMoney().toMoney(order.total) }} VNĐ</UiText>
      </UiFlex>

      <UiFlex justify="center" v-if="!!order.pay && !!order.pay.qrcode">
        <UiImg :src="order.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
      </UiFlex>
    </UiFlex>

    <div class="bg-gray-1000 p-4 rounded-2xl mb-2">
      <DataEmpty text="Giỏ hàng trống" v-if="!order.cart || order.cart.length == 0"></DataEmpty>

      <UiFlex type="col" class="gap-2" v-else>
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

    <UButton block color="orange" @click="onSuccess" :loading="successing">Xác Nhận Đã Giao Và Nhận Tiền</UButton>
  </div>
</template>

<script setup>
const props = defineProps(['area', 'spot', 'ticket'])

const order = ref(null)
const loading = ref(true)
const successing = ref(false)

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

const getOrder = async () => {
  try {
    loading.value = true
    const data = await useAPI('ticket/staff/order/get', { code: props.ticket.code })

    order.value = data
    loading.value = false
  }
  catch (e) {
    order.value = null
    loading.value = false
  } 
}

const onSuccess = async () => {
  try {
    successing.value = true
    const data = await useAPI('ticket/staff/order/success', { ticket: props.ticket.code, order: order.value.code })

    successing.value = false
    getOrder()
  }
  catch (e) {
    successing.value = false
  } 
}

onMounted(() => setTimeout(() => getOrder(), 1))
</script>