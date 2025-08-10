<template>
  <UiContent title="Cài Đặt Hội Viên"  sub="Chỉnh sửa thông tin hội viên">
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

      <template #week>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Giá bán">
              <UInput v-model="state.member.week.price" type="number" />
            </UFormGroup>

            <UFormGroup label="Giảm giá">
              <UInput v-model="state.member.week.discount" type="number" />
            </UFormGroup>

            <UFormGroup label="Tặng lượt quay">
              <UInput v-model="state.member.week.wheel" type="number" />
            </UFormGroup>

            <UFormGroup label="Tặng cơm">
              <UInput v-model="state.member.week.free.lunch" type="number" />
            </UFormGroup>

            <UFormGroup label="Tặng giờ câu">
              <UInput v-model="state.member.week.free.time" type="number" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update('contact')" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #month>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Giá bán">
              <UInput v-model="state.member.month.price" type="number" />
            </UFormGroup>

            <UFormGroup label="Giảm giá">
              <UInput v-model="state.member.month.discount" type="number" />
            </UFormGroup>

            <UFormGroup label="Tặng lượt quay">
              <UInput v-model="state.member.month.wheel" type="number" />
            </UFormGroup>

            <UFormGroup label="Tặng cơm">
              <UInput v-model="state.member.month.free.lunch" type="number" />
            </UFormGroup>

            <UFormGroup label="Tặng giờ câu">
              <UInput v-model="state.member.month.free.time" type="number" />
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
  member: {
    week: {
      price: 0,
      discount: 0,
      wheel: 0,
      free: {
        lunch: 0
      }
    },
    month: {
      price: 0,
      discount: 0,
      wheel: 0,
      free: {
        lunch: 0
      }
    }
  }
})

const menu = [
  { label: 'Tuần', slot: 'week', defaultOpen: true },
  { label: 'Tháng', slot: 'month' },
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