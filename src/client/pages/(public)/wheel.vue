<template>
  <UiFlex type="col" justify="center" class="w-full max-w-[800px] mx-auto px-4">
    <UiFlex type="col" justify="center" class="mb-6">
      <UiText class="uppercase text-[1.5rem] md:text-[2rem]" weight="semibold" align="center">Vòng Quay May Mắn</UiText>
      <UiText color="gray" class="text-base md:text-xl mb-4" align="center">
        Quy đổi <b class="text-primary">1</b> lượt quay với mỗi <b class="text-primary">{{ useMoney().toMoney(500000) }} VNĐ</b> chi tiêu trong tuần
      </UiText>
      <div class="ribbon" v-if="!!authStore.isLogin">
        <b class="font-bold">{{ authStore.profile.currency.wheel }}</b> lượt
      </div>
    </UiFlex>

    <UiFlex class="Circle rounded-full" justify="center" :style="{
      '--wheel-circle-deg': deg.now+'deg',
    }">
      <canvas id="Canvas" :width="size" :height="size"></canvas>
      <UiFlex justify="center" class="Circle__Start bg-gray-900" @click="start">
        <UiIcon name="i-bxs-color" class="beat-anim" size="10" v-if="!loading.spin"></UiIcon>
        <UiIcon name="i-bxs-color" class="animate-spin" size="10" v-else></UiIcon>
      </UiFlex>
    </UiFlex>

    <UiFlex type="col" class="my-6 gap-1">
      <UButton icon="i-bx-plus" variant="soft" :loading="loading.add" @click="addWheel">Quy Đổi Lượt Quay</UButton>
      <UButton icon="i-bx-search" variant="soft" @click="view = true">Xem Giải Thưởng</UButton>
    </UiFlex>

    <!-- <UiFlex type="col" justify="center" class="mt-24 mb-6">
      <UiText weight="bold" align="center" class="text-3xl md:text-5xl md:mb-3 mb-2 Slogan">Lucky</UiText>
      <UiText color="gray" class="text-sm md:text-lg mb-1" align="center">
        Danh sách những người may mắn
      </UiText>
    </UiFlex>

    <div class="w-full max-w-[800px]">
      <DataWheelLucky />
    </div> -->

    <UModal v-model="modal" :ui="{width: 'sm:max-w-[250px] max-w-[250px]'}">
      <UiFlex type="col" class="bg-card rounded-2xl py-12 px-4 cursor-pointer" justify="center" v-if="gift" @click="modal = false">
        <UiIcon :name="gift.type != 0 ? 'i-bxs-party' : 'i-bxs-sad'" class="jump-anim mb-6" size="16"></UiIcon>
        <UiText align="center" v-if="gift.type != 0">Chúc mừng bạn nhận được <b class="text-primary font-bold">[{{ gift.name }}]</b></UiText>
        <UiText align="center" weight="semibold" v-else>Chúc bạn may mắn lần sau</UiText>
      </UiFlex>
    </UModal>

    <UModal v-model="view">
      <UiContent title="Phần Thưởng" sub="Danh sách phần thưởng" class="bg-card rounded-2xl p-4">
        <template #more>
          <UButton icon="i-bx-x" class="ml-auto" size="2xs" color="gray" square @click="view = false"></UButton>
        </template>
        <DataWheelView></DataWheelView>
      </UiContent>
    </UModal>
  </UiFlex>
</template>

<script setup>
const configStore = useConfigStore()
const authStore = useAuthStore()

const gift = ref(undefined)
const prizes = ref([])

const colors = [
  "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FF9933", "#33FFF0",
  "#F033FF", "#33FF99", "#FF5733", "#9933FF", "#33A1FF", "#FF3377"
]

const size = computed(() => {
  return 350
})

const modal = ref(false)
const view = ref(false)
const loading = ref({
  list: true,
  spin: false,
  add: false
})

const deg = ref({
  now: 0,
  end: 0
})
const canvasPos = ref({
  el: undefined,
  ctx: undefined,
  radius: size.value / 2,
  centerX: 0,
  centerY: 0,
})
const sliceAngle = computed(() => {
  return (2 * Math.PI) / prizes.value.length
})

const initCanvas = () => {
  canvasPos.value.el = document.getElementById('Canvas')
  canvasPos.value.ctx = canvasPos.value.el.getContext('2d')
  canvasPos.value.centerX = canvasPos.value.el.width / 2;
  canvasPos.value.centerY = canvasPos.value.el.height / 2;
  canvasPos.value.el.addEventListener('transitionend', stop)
  drawWheel()
}

const drawWheel = () => {
  for (let i = 0; i < prizes.value.length; i++) {
    canvasPos.value.ctx.beginPath();
    canvasPos.value.ctx.moveTo(canvasPos.value.centerX, canvasPos.value.centerY);
    canvasPos.value.ctx.arc(canvasPos.value.centerX, canvasPos.value.centerY, canvasPos.value.radius, sliceAngle.value * i + 0, sliceAngle.value * (i + 1) + 0);
    canvasPos.value.ctx.fillStyle = colors[i % colors.length];
    canvasPos.value.ctx.fill();
    canvasPos.value.ctx.stroke();

    canvasPos.value.ctx.save();
    canvasPos.value.ctx.translate(canvasPos.value.centerX, canvasPos.value.centerY);
    canvasPos.value.ctx.rotate(sliceAngle.value * i + sliceAngle.value / 2 + 0);
    canvasPos.value.ctx.textAlign = "right";
    canvasPos.value.ctx.fillStyle = "#333";
    canvasPos.value.ctx.font = "bold 12px Montserrat, sans-serif";
    canvasPos.value.ctx.fillText(prizes.value[i]['name'], canvasPos.value.radius - 20, 5);
    canvasPos.value.ctx.restore();
  }
}

const animation = () => {
  if(deg.value.now > deg.value.end){
    deg.value.now += Math.floor(Math.PI * 18) * -1
    window.requestAnimationFrame(animation)
  }
  else {
    deg.value.now = deg.value.end
    window.cancelAnimationFrame(animation)
  }
}
const stop = async () => {
  await authStore.setAuth()
  loading.value.spin = false

  modal.value = true
}

const start = async () => {
  try {
    if(!authStore.isLogin) return authStore.setModal(true)
    if(!!loading.value.spin) return 

    getList()
    loading.value.spin = true

    const data = await useAPI('wheel/public/spin')
    gift.value = data
    const index = prizes.value.findLastIndex(i => i._id == gift.value._id)
    const aDeg = 360 / prizes.value.length
    const min = Math.ceil((aDeg * index) + 5)
    const max = Math.floor((aDeg * index) + aDeg - 5)
    const rand = Math.floor(Math.random() * (max - min + 1) + min) * -1
    deg.value.end = rand + (Math.floor(deg.value.now / 360) - 20) * 360

    window.requestAnimationFrame(animation)
  }
  catch(e){
    loading.value.spin = false
  }
}

const getList = async () => {
  try {
    loading.value.list = true
    const data = await useAPI('wheel/public/list')
    prizes.value = data

    initCanvas()
  }
  catch(e){
    loading.value.list = false
  }
}

const addWheel = async () => {
  try {
    loading.value.add = true
    await useAPI('wheel/public/add')
    await authStore.setAuth()
    loading.value.add = false
  }
  catch(e){
    loading.value.add = false
  }
}

onMounted(() => setTimeout(() => (initCanvas(), getList()), 1))
</script>

<style lang="sass">
.Circle
  display: inline-flex
  position: relative
  box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.5), inset 0 0 20px 3px rgb(0 0 0 / 97%)
  z-index: 1
  #Canvas
    position: relative
    border: 5px solid #333
    border-radius: 50%
    transform: rotate(var(--wheel-circle-deg))
    transition: transform 2s ease
    z-index: -1
  &__Start
    position: absolute
    width: 70px
    height: 70px
    border-radius: 50%
    border: 5px solid #fff
    cursor: pointer
    user-select: none
    &::after
      content: ''
      position: absolute
      right: -50%
      width: 60%
      height: 60%
      background: inherit
      clip-path: polygon(100% 50%, 0 20%, 0 80%)
      z-index: 0

.ribbon
  font-size: 12px
  color: #fff
  --s :1.8em
  --d:.5em
  --c:.8em
  padding: 0 calc(var(--s) + var(--d) + .5em) var(--d)
  line-height: 1.8
  background: linear-gradient(90deg, #0004 var(--d), #0000 0 calc(100% - var(--d)), #0004 0) (50% / calc(100% - 2*var(--s))) 100% no-repeat
  clip-path: polygon(0 100%, var(--s) 100%, calc(var(--s) + var(--d)) calc(100% - var(--d)), calc(100% - var(--s) - var(--d)) calc(100% - var(--d)), calc(100% - var(--s)) 100%, 100% 100%, calc(100% - var(--c)) calc(50% + var(--d)/2), 100% var(--d), calc(100% - var(--s)) var(--d), calc(100% - var(--s) - var(--d)) 0, calc(var(--s) + var(--d)) 0, var(--s) var(--d), 0 var(--d), var(--c) calc(50% + var(--d)/2))
  background-color: rgb(var(--color-primary-500))
  width: fit-content

.Slogan
  background: linear-gradient(to right,#FFFFFF 10%, #ffffff00 50%, #FFFFFF 60%)
  background-size: auto auto
  background-clip: border-box
  background-size: 200% auto
  background-clip: text
  text-fill-color: transparent
  -webkit-background-clip: text
  -webkit-text-fill-color: transparent
  animation: textclip 2s linear infinite

@keyframes textclip
  to
    background-position: -200% center
</style>