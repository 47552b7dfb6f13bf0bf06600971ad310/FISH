<template>
  <div>
    <UiFlex >
      <UTabs class="w-full sm:w-auto" v-model="tab" :items="[
        { label: 'Hôm nay' }, 
        { label: 'Hôm qua' }, 
        { label: 'Tháng này' }, 
        { label: 'Tháng trước' }, 
        { label: 'Tổng' }
      ]" />
    </UiFlex>

    <UiFlex class="mb-2 max-w-[300px] w-full">
      <SelectUserStaff v-model="staff" class="w-full" />
    </UiFlex>
    
    <div class="mb-2">
      <div class="grid grid-cols-12 gap-2 mb-2">
        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.ticket">
          <UiFlex justify="between">
            <UAvatar icon="i-mdi-ticket" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Vé Chuyển Khoản</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="primary" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.ticket.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.ticket">
          <UiFlex justify="between">
            <UAvatar icon="i-mdi-ticket" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Vé Tiền Mặt</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="primary" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.ticket.money) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.ticket">
          <UiFlex justify="between">
            <UAvatar icon="i-mdi-ticket" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Tổng Vé</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="primary" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.ticket.money + data.ticket.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>
      </div>

      <div class="grid grid-cols-12 gap-2 mb-2">
        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.item">
          <UiFlex justify="between">
            <UAvatar icon="i-bx-cart-alt" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Dịch Vụ Chuyển Khoản</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="yellow" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.item.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.item">
          <UiFlex justify="between">
            <UAvatar icon="i-bx-cart-alt" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Dịch Vụ Tiền Mặt</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="yellow" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.item.money) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.item">
          <UiFlex justify="between">
            <UAvatar icon="i-bx-cart-alt" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Tổng Dịch Vụ</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="yellow" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.item.money + data.item.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>
      </div>

      <div class="grid grid-cols-12 gap-2 mb-2">
        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.connect">
          <UiFlex justify="between">
            <UAvatar icon="i-carbon-connect" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Nối Ca Chuyển Khoản</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="orange" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.connect.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.connect">
          <UiFlex justify="between">
            <UAvatar icon="i-carbon-connect" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Nối Ca Tiền Mặt</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="orange" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.connect.money) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }" v-if="data.connect">
          <UiFlex justify="between">
            <UAvatar icon="i-carbon-connect" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Tổng Nối Ca</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="orange" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.connect.money + data.connect.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>
      </div>

      <div class="grid grid-cols-12 gap-2">
        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }">
          <UiFlex justify="between">
            <UAvatar icon="i-solar-money-bag-bold" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Doanh Thu Chuyển Khoản</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="green" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.ticket.bank + data.item.bank+ data.connect.bank) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }">
          <UiFlex justify="between">
            <UAvatar icon="i-solar-money-bag-bold" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Doanh Thu Tiền Mặt</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="green" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.ticket.money + data.item.money + data.connect.money) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>

        <UCard class="lg:col-span-4 sm:col-span-12 col-span-12" :ui="{ body: { padding: 'px-4 md:px-8 py-6 md:py-8' } }">
          <UiFlex justify="between">
            <UAvatar icon="i-solar-money-bag-bold" size="2xl" class="mr-4" />
            <UiFlex type="col" items="end">
              <UiText color="gray" align="right">Tổng Doanh Thu</UiText>
              <USkeleton v-if="!!loading" class="w-28 h-7 md:h-8 xl:h-9" />
              <UiText v-else color="green" align="right" weight="bold" class="text-xl md:text-2xl xl:text-3xl">{{ toMoney(data.ticket.bank + data.item.bank+ data.connect.bank + data.ticket.money + data.item.money + data.connect.money) }}</UiText>
            </UiFlex>
          </UiFlex>
        </UCard>
      </div>
    </div>

    <div v-if="!!staff">
      <UiFlex class="mb-2">
        <UTabs v-model="tabMore" :items="tabMoreList"></UTabs>
      </UiFlex>

      <ManageStatisticStaffTicket v-if="tabMore == 0" :staff="staff" />
      <ManageStatisticStaffOrder v-if="tabMore == 1" :staff="staff" />
      <ManageStatisticStaffConnect v-if="tabMore == 2" :staff="staff" />
    </div>
  </div>
</template>

<script setup>
const { toMoney } = useMoney()

const loading = ref(false)
const tab = ref(0)
const staff = ref()
const data = ref({
  ticket: {
    bank: 0,
    money: 0
  },
  item: {
    bank: 0,
    money: 0
  },
  connect: {
    bank: 0,
    money: 0
  }
})

const tabMore = ref(0)
const tabMoreList = [
  { label: 'Vé câu', key: 'ticket' },
  { label: 'Dịch vụ', key: 'order' },
  { label: 'Nối ca', key: 'connect' },
]

watch(tab, () => getData())
watch(staff, () => getData())

const type = computed(() => {
  if(tab.value == 0) return 'today'
  if(tab.value == 1) return 'yesterday'
  if(tab.value == 2) return 'month'
  if(tab.value == 3) return 'lastmonth'
  if(tab.value == 4) return 'total'
})

const getData = async () => {
  try {
    loading.value = true
    const get = await useAPI('statistic/staff/fast', { 
      type: type.value,
      staff: staff.value
    })

    data.value = get
    loading.value = false
  }
  catch {
    return
  }
}

getData()
</script>