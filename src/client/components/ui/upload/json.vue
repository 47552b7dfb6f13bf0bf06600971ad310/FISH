<template>
  <div>
    <input @change="onFileChange" type="file" accept=".json" ref="input" hidden class="none">
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
    if(files.length == 0) throw 'Vui lòng chọn file JSON trước'

    const file = files[0]
    const isJson = file.type === 'application/json'
    if(!isJson) throw 'Chỉ hỗ trợ định dạng file (json)'

    const is10M = file.size / 1024 / 1024 < 10
    if (!is10M) throw 'Chỉ hỗ trợ file JSON dung lượng nhỏ hơn 10MB'

    const formData = new FormData()
    formData.append('json', file)

    const response = await fetch('/api/upload/json', {
      method: 'POST',
      body: formData
    })
    const responseJSON = await response.json()
    if(responseJSON.code != 200) throw responseJSON.message

    const url = responseJSON.result
    if(!url) throw 'Tải JSON không thành công'

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