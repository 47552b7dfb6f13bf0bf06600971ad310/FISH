<template>
  <div v-if="!!order" class="w-full md:max-w-[70%] mx-auto">
    <UiText color="green" size="sm" align="center" class="mb-4">Vui lòng đợi nhân viên đến giao món và thanh toán</UiText>

    <div class="bg-gray-1000 p-4 rounded-2xl">
      <UiText size="lg" weight="semibold" class="mb-4">Đơn hàng đang xử lý...</UiText>

      <UiFlex type="col" class="gap-2">
        <UiFlex class="bg-gray rounded-2xl p-4 md:p-2 gap-4 w-full" v-for="product in order.cart" :key="product.item._id">
          <UiImg :src="product.item.image" w="1" h="1" class="bg-gray-1000 rounded-xl max-w-[80px]"/>
          <div>
            <UiText weight="semibold" class="text-base line-clamp-1 mb-1">{{ product.item.name }}</UiText>
            <UiText color="gray" class="text-sm line-clamp-1">Số lượng {{ useMoney().toMoney(product.amount) }}</UiText>
          </div>
        </UiFlex>
      </UiFlex>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['ticket', 'order'])

const configStore = useConfigStore()
</script>