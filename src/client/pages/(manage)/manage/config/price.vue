<template>
  <UiContent title="Giá Cơm Và Giá Giờ Câu"  sub="Chỉnh sửa thông tin giá cả khác">
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
  }
})

const menu = [
  { label: 'Giá cơm hằng ngày', slot: 'lunch', defaultOpen: true },
  { label: 'Giá mua thêm giờ', slot: 'overtime' },
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