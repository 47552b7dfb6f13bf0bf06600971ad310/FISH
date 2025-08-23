<template>
  <UiContent title="Thông Tin Hồ"  sub="Chỉnh sửa thông tin hồ câu">
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

      <template #basic>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Tên hồ">
              <UInput v-model="state.name" />
            </UFormGroup>

            <UFormGroup label="Địa chỉ">
              <UInput v-model="state.address" />
            </UFormGroup>

            <UFormGroup label="Mô tả">
              <UTextarea autoresize v-model="state.description" name="input" />
            </UFormGroup>

            <UFormGroup label="Logo">
              <UiUploadImage v-model="state.image.logo">
                <template #default="{ select, loading }">
                  <UInput :model-value="state.image.logo" :loading="loading" readonly @click="select"/>
                </template>
              </UiUploadImage>
            </UFormGroup>

            <UFormGroup label="Banner">
              <UiUploadImage v-model="state.image.banner">
                <template #default="{ select, loading }">
                  <UInput :model-value="state.image.banner" :loading="loading" readonly @click="select"/>
                </template>
              </UiUploadImage>
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update()" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #contact>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Tên chủ hồ">
              <UInput v-model="state.contact.owner" />
            </UFormGroup>

            <UFormGroup label="Số điện thoại">
              <UInput v-model="state.contact.phone" />
            </UFormGroup>

            <UFormGroup label="Hòm thư">
              <UInput v-model="state.contact.email"/>
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update()" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #social>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Facebook">
              <UInput v-model="state.social.facebook" />
            </UFormGroup>

            <UFormGroup label="Messenger">
              <UInput v-model="state.social.messenger" />
            </UFormGroup>

            <UFormGroup label="Zalo">
              <UInput v-model="state.social.zalo" />
            </UFormGroup>

            <UFormGroup label="Tiktok">
              <UInput v-model="state.social.tiktok" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update()" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #time>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="Bảo trì">
              <SelectDate time v-model="state.time.create" />
            </UFormGroup>

            <UFormGroup label="Giờ đặt vé">
              <UiFlex class="gap-1">
                <UInput v-model="state.time.ticket.start" type="time" class="grow" />
                <UInput v-model="state.time.ticket.end" type="time" class="grow" />
              </UiFlex>
            </UFormGroup>

            <UFormGroup label="Giờ tính ca đêm">
              <UiFlex class="gap-1">
                <UInput v-model="state.time.night.start" type="time" class="grow" />
                <UInput v-model="state.time.night.end" type="time" class="grow" />
              </UiFlex>
            </UFormGroup>

            <UFormGroup label="Thời gian chờ thanh toán (Phút)">
              <UInput v-model="state.time.pay" type="number" />
            </UFormGroup>

            <UFormGroup label="Thời gian chờ dọn đồ (Phút)">
              <UInput v-model="state.time.delay" type="number" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update()" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>

      <template #tele>
        <UCard>
          <UForm :state="state">
            <UFormGroup label="API Thông Báo Vé Mới">
              <UInput v-model="state.telegram.ticket" />
            </UFormGroup>

            <UFormGroup label="API Thông Báo Gọi Dịch Vụ">
              <UInput v-model="state.telegram.order" />
            </UFormGroup>

            <UFormGroup label="API Thông Báo Nạp Sen">
              <UInput v-model="state.telegram.payment" />
            </UFormGroup>

            <UFormGroup label="API Thông Báo Hội Viên Mới">
              <UInput v-model="state.telegram.member" />
            </UFormGroup>

            <UiFlex justify="end" class="mt-4">
              <UButton color="yellow" @click="update()" :loading="updating">Cập nhật</UButton>
            </UiFlex>
          </UForm>
        </UCard>
      </template>
    </UAccordion>
  </UiContent>
</template>

<script setup>
import { SelectDate, UiFlex } from '#components'

const { bootConfig } = useConfigStore()

const load = ref(true)
const updating = ref(false)

const state = ref({
  name: '',
  description: '',
  address: '',
  image: {
    logo: '',
    banner: '',
  },

  contact: {
    owner: '',
    phone: '',
    email: '',
  },

  social: {
    facebook: '',
    messenger: '',
    zalo: '',
    tiktok: ''
  },

  time: {
    create: null,
    start: null,
    delay: null,
    pay: null,
    night: {
      start: null,
      end: null
    },
    ticket: {
      start: null,
      end: null
    }
  },

  telegram: {
    ticket: '',
    order: '',
    payment: '',
    member: '',
  }
})

const menu = [
  { label: 'Cơ bản', slot: 'basic' },
  { label: 'Liên hệ', slot: 'contact' },
  { label: 'Mạng xã hội', slot: 'social' },
  { label: 'Thời gian', slot: 'time' },
  { label: 'Telegram', slot: 'tele' },
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