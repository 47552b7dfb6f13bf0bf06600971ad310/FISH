<template>
  <div>
    <input @change="onFileChange" type="file" accept=".jpg,.jpeg,.png,.webp,.gif" ref="input" hidden class="none">
    <slot :select="selectFile" :loading="loading"></slot>
  </div>
</template>

<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const { success, error } = useNotify()

const input = ref()
const loading = ref(false)

const selectFile = () => input.value.click()

const onFileChange = async (e) => {
  try {
    loading.value = true

    const files =  e.target.files
    if(files.length == 0) throw 'Vui lòng chọn hình ảnh trước'

    const file = files[0]
    const isImage = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'].includes(file.type)
    if(!isImage) throw 'Chỉ hỗ trợ định dạng ảnh (jpg|jpeg|png|webp|gif|svg)'

    const is10M = file.size / 1024 / 1024 < 10
    if (!is10M) throw 'Chỉ hỗ trợ ảnh dung lượng nhỏ hơn 10MB'

    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData
    })
    const responseJSON = await response.json()
    if(responseJSON.code != 200) throw responseJSON.message

    const url = responseJSON.result
    if(!url) throw 'Tải ảnh không thành công'

    emit('update:modelValue', url)
    e.target.value = ""

    loading.value = false
    success(responseJSON.message)
  }
  catch(err) {
    e.target.value = ""
    loading.value = false
    error(err.toString())
  }
}
</script>