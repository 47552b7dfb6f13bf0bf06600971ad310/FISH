<template>
  <UiContent title="Giá và Khuyến Mãi"  sub="Chỉnh sửa thông tin giá cả khác">
    <UAccordion
      color="primary"
      variant="soft"
      size="md"
      :items="menu"
    >
      <template #default="{ item, open }">
        <UButton size="md" class="mb-2" :class="{
          'bg-gray-1000' : !open,
          'color-blue-light bg-anim-light': !!open
        }">
          <UiText class="text-white">{{ item.label }}</UiText>
        </UButton>
      </template>

      <template #lunch>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Giá bán">
              <UInput v-model="state.lunch.price" type="number" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update('basic')" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #overtime>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Theo giờ">
              <UInput v-model="state.overtime.step" type="number" />
            </UFormGroup>

            <UFormGroup label="Giá bán">
              <UInput v-model="state.overtime.price" type="number" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update('social')" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #voucher>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Đăng ký tặng phiếu">
              <SelectVoucherManage v-model="state.reg.voucher.source"  />
            </UFormGroup>

            <UFormGroup label="Số lượng">
              <UInput v-model="state.reg.voucher.amount" type="number" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update('social')" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #miss>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Lần 1">
              <UInput v-model="state.miss[1]" type="number" />
            </UFormGroup>

            <UFormGroup label="Lần 2">
              <UInput v-model="state.miss[2]" type="number" />
            </UFormGroup>

            <UFormGroup label="Lớn hơn 3 lần">
              <UInput v-model="state.miss[3]" type="number" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update('social')" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #wheel>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Giá quy đổi">
              <UInput v-model="state.wheel.price" type="number" />
            </UFormGroup>

            <UFormGroup label="Trạng thái">
              <USelectMenu v-model="state.wheel.start" size="lg" value-attribute="value" :options="[
                { label: 'Hiện', value: true },
                { label: 'Ẩn', value: false }
              ]">
                <template #label>
                  <span v-if="state.wheel.start === undefined">Chọn loại</span>
                  <span v-else>{{ state.wheel.start ? 'Bật' : 'Tắt' }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update('social')" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>
    </UAccordion>
  </UiContent>
</template>

<script setup>
const { bootConfig } = useConfigStore()

const load = ref(true)
const updating = ref(false)

const state = ref({
  overtime: {
    step: null,
    price: null
  },
  lunch: {
    price: null
  },
  reg: {
    voucher: {
      source: null,
      amount: null,
    }
  },
  miss: {
    1: null,
    2: null,
    3: null,
  },
  wheel: {
    price: null,
    start: false
  }
})

const menu = [
  { label: 'Giá cơm hằng ngày', slot: 'lunch', defaultOpen: true },
  { label: 'Giá mua thêm giờ', slot: 'overtime' },
  { label: 'Khuyến mãi tạo tài khoản', slot: 'voucher' },
  { label: 'Tặng khuyến mãi móm', slot: 'miss' },
  { label: 'Vòng quay tuần', slot: 'wheel' },
]

const getConfig = async () => {
  const config = await useAPI('config/manage/get')
  state.value = Object.assign(state.value, config)
  load.value = false
}

const update = async () => {
  try {
    updating.value = true
    await useAPI('config/manage/update', JSON.parse(JSON.stringify(state.value)))
    bootConfig()
    getConfig()
    updating.value = false
  }
  catch(e) {
    updating.value = false
  }
}

getConfig()
</script>