<template>
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

      <UiFlex justify="center" v-if="!!order.pay && !!order.pay.qrcode && pay_type == 'BANK'">
        <UiImg :src="order.pay.qrcode" class="w-[200px] md:max-w-[200px]"/>
      </UiFlex>
    </UiFlex>

    <div class="bg-gray-1000 p-4 rounded-2xl mb-2">
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

    <SelectPayType v-model="pay_type" class="mb-2" />

    <UiFlex class="gap-1 w-full">
      <UButton color="green" class="grow justify-center" @click="onSuccess" :loading="successing">Đã Thanh Toán</UButton>
      <UButton color="rose" class="grow justify-center" @click="onCancel" :loading="successing">Hủy Đơn</UButton>
    </UiFlex>
  </div>
</template>

<script setup>
const props = defineProps(['order', 'ticket'])
const emits = defineEmits(['done'])

const successing = ref(false)
const canceling = ref(false)
const pay_type = ref(null)

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
    await useAPI('ticket/staff/order/success', { ticket: props.ticket.code, order: props.order.code, pay_type: pay_type.value })

    successing.value = false
    emits('done')
  }
  catch (e) {
    successing.value = false
  } 
}

const onCancel = async () => {
  try {
    canceling.value = true
    await useAPI('ticket/staff/order/cancel', { ticket: props.ticket.code, order: props.order.code })

    canceling.value = false
    emits('done')
  }
  catch (e) {
    canceling.value = false
  } 
}
</script>