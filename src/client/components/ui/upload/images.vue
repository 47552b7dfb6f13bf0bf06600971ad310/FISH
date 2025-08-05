<template>
  <div>
    <input @change="onFileChange" type="file" accept=".jpg,.jpeg,.png,.webp,.gif" ref="input" hidden class="none" multiple>

    <UiFlex class="gap-1 flex-wrap">
      <UiFlex 
        v-for="(item, index) in list" :key="index"
        justify="center"
        class="
          h-16 w-16 min-w-16 min-h-16 max-h-16 max-w-16
          bg-gray-200 dark:bg-gray-800
          rounded-2xl cursor-pointer overflow-hidden
        "
        @click="onViewFile(item, index)"
      >
        <UiImg :src="item" w="1" h="1" class="w-16 h-16"/>
      </UiFlex>

      <UiFlex 
        justify="center"
        class="
          h-16 w-16 min-w-16 min-h-16 max-h-16 max-w-16
          bg-gray-200 dark:bg-gray-800
          rounded-2xl cursor-pointer overflow-hidden
        "
        @click="selectFile"
      >
        <UiIcon name="i-bx-plus" size="8" />
      </UiFlex>
    </UiFlex>

    <UModal v-model="open" fullscreen :ui="{
      fullscreen: 'w-auto h-auto max-w-full max-h-[100vh] !overflow-hidden'
    }">
      <UiFlex justify="center" class="w-full h-full">
        <img :src="imgSelect.src" class="max-h-[90vh] w-auto object-contain rounded-2xl"/>
      </UiFlex>

      <UiFlex class="absolute top-1 right-1 gap-0.5">
        <UButton color="red" @click="onDelImage(imgSelect.index)">Xóa</UButton>
        <UButton color="gray" @click="open = false">Đóng</UButton>
      </UiFlex>
    </UModal>
  </div>
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const input = ref()
const loading = ref(false)
const open = ref(false)

const list = ref(props.modelValue || [])
const imgSelect = ref({
  src: null,
  index: null
})

const selectFile = () => input.value.click()

const onFileChange = async (e) => {
  try {
    if(!!loading.value) throw 'Vui lòng đợi...'
    loading.value = true

    const files =  e.target.files
    if(files.length == 0) throw 'Vui lòng chọn ít nhất 1 hình ảnh trước'

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      const responseJSON = await response.json()
      if(responseJSON.code == 200 && !!responseJSON.result) list.value.push(responseJSON.result)
    }

    loading.value = false
    emit('update:modelValue', list)
    e.target.value = ""
  }
  catch(err) {
    e.target.value = ""
    loading.value = false
    useNotify().error(err.toString())
  }
}

const onViewFile = (src, index) => {
  imgSelect.value.src = src
  imgSelect.value.index = index
  open.value = true
}

const onDelImage = (index) => {
  list.value.splice(index, 1)
  open.value = false
}
</script>