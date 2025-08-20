<template>
  <div class="bg-gray-1000 p-4 rounded-2xl">
    <UiFlex class="mb-2">
      <UiText size="lg" weight="semibold">Giỏ Hàng ({{ cartData.amount }})</UiText>

      <UButton color="orange" variant="outline" icon="i-bx-cart" class="ml-auto" @click="modal = true">{{ useMoney().toMoney(cartData.total) }} VNĐ</UButton>
    </UiFlex>

    <SelectItemCategoryGuest v-model="page.category" class="mb-3" />

    <div>
      <DataEmpty text="Không có sản phầm nào bày bán" class="min-h-[300px]" :loading="loading.load" v-if="!!loading.load || list.length == 0"></DataEmpty>
      <div class="grid grid-cols-12 gap-2">
        <UiFlex class="col-span-6 bg-gray rounded-2xl p-4 md:p-2 gap-2 md:gap-4 flex-col md:flex-row" v-for="item in list" :key="item._id">
          <UiImg :src="item.image" w="1" h="1" class="bg-gray-1000 rounded-xl max-w-[80px]"/>
          <div>
            <UiText weight="semibold" class="text-sm md:text-base text-center md:text-start line-clamp-1">{{ item.name }}</UiText>
            <UiText color="gray" class="text-sm text-center md:text-start line-clamp-1">{{ useMoney().toMoney(item.price) }}</UiText>
            <UButtonGroup size="xs" class="mt-2">
              <UButton color="white" icon="i-bx-minus" square @click="minus(item)"></UButton>
              <UButton color="white" disabled>{{ cart[item._id] ? cart[item._id]['amount'] : 0 }}</UButton>
              <UButton color="white" icon="i-bx-plus" square @click="add(item)"></UButton>
            </UButtonGroup>
          </div>
        </UiFlex>
      </div>
    </div>

    <UModal v-model="modal">
      <UiContent title="Đơn Hàng" color="orange" sub="Kiểm tra các dịch vụ đã gọi" class="bg-card p-4 rounded-2xl">
        <template #more>
          <UButton color="green" variant="outline" class="ml-auto">{{ useMoney().toMoney(cartData.total) }} VNĐ</UButton>
        </template>

        <DataEmpty text="Giỏ hàng trống" v-if="cartData.amount == 0"></DataEmpty>

        <UiFlex type="col" class="gap-2" v-else>
          <UiFlex class="bg-gray rounded-2xl p-4 md:p-2 gap-4 w-full" v-for="(value, key) in cart" :key="key">
            <UiImg :src="value.item.image" w="1" h="1" class="bg-gray-1000 rounded-xl max-w-[80px]"/>
            <div>
              <UiText weight="semibold" class="text-base line-clamp-1">{{ value.item.name }}</UiText>
              <UiText color="gray" class="text-sm line-clamp-1">{{ useMoney().toMoney(value.item.price) }}</UiText>
              <UButtonGroup size="xs" class="mt-2">
                <UButton color="white" icon="i-bx-minus" square @click="minus(value.item)"></UButton>
                <UButton color="white" disabled>{{ value.amount }}</UButton>
                <UButton color="white" icon="i-bx-plus" square @click="add(value.item)"></UButton>
              </UButtonGroup>
            </div>
          </UiFlex>

          <UiFlex justify="between" class="w-full gap-1">
            <UButton color="rose" size="lg" @click="resetCart" variant="outline">Xóa Giỏ Hàng</UButton>
            <UButton color="orange" size="lg" @click="modal = false">Xác Nhận</UButton>
          </UiFlex>
        </UiFlex>
      </UiContent>
    </UModal>
  </div>
</template>

<script setup>
const emits = defineEmits(['done'])

const loading = ref({
  load: true
})

const modal = ref(false)

const list = ref([])

const cart = ref({})
const cartData = computed(() => {
  const product = Object.keys(cart.value).length
  let total = 0
  let amount = 0
  let list = []
  for (const [key, value] of Object.entries(cart.value)) {
    const price = value.amount * value.item.price
    total = total + price
    amount = amount + value.amount 
    list.push({
      item: value.item._id,
      amount: value.amount,
      price: value.item.price
    })
  }

  return { product, total, amount, list }
})

const page = ref({
  category: null
})
watch(() => page.value.category, () => getList())

const minus = (item) => {
  if(!!cart.value[item._id]){
    cart.value[item._id]['amount'] = cart.value[item._id]['amount'] - 1
    if(cart.value[item._id]['amount'] == 0) delete cart.value[item._id]
  }

  onOrder()
}

const add = (item) => {
  if(!!cart.value[item._id]){
    cart.value[item._id]['amount'] = cart.value[item._id]['amount'] + 1
  }
  else {
    cart.value[item._id] = { item: item, amount: 1 }
  }

  onOrder()
}

const resetCart = () => {
  modal.value = false
  cart.value = {}
}

const getList = async () => {
  try {
    loading.value.load = true
    const data = await useAPI('item/public/list', JSON.parse(JSON.stringify(page.value)))

    loading.value.load = false
    list.value = data
  }
  catch (e) {
    loading.value.load = false
  } 
}

const onOrder = async () => {
  const cartValue = JSON.parse(JSON.stringify(cartData.value))
  emits('done', cartValue)
}
</script>