<script setup>
import { useOgStore } from "@/stores/store"
import { storeToRefs } from "pinia"
const store = useOgStore()
const { logoImage, bgImage } = storeToRefs(store)

const props = defineProps({ imageType: String })

const dragOver = ref()
const files = ref()
const imageFile = ref()

// nuxt only
const setFiles = (e) => {
  files.value = e.target.files
}

// save to storage
const saveToStorage = async (file, type) => {
  // convert image file to base64 string
  const reader = new FileReader()
  reader.addEventListener("load", () => localStorage.setItem(type, reader.result), false)

  if (file) reader.readAsDataURL(file)
}

// Handle image uploads
watch(files, () => uploadFiles())

const uploadFiles = () => {
  if (files.value && process.client) {
    imageFile.value = URL.createObjectURL(files.value[0])
    props.imageType === "bg" ? (bgImage.value = imageFile.value) : (logoImage.value = imageFile.value)
    localStorage.setItem("blob", imageFile.value)
    saveToStorage(files.value[0], props.imageType)
  }
}

// Handle image drag
function handleDragDrop(e) {
  if (process.client) {
    e.preventDefault()
    const uploadedFile = e.dataTransfer.files
    imageFile.value = URL.createObjectURL(uploadedFile[0])
    props.imageType === "bg"
      ? (bgImage.value = imageFile.value)
      : (logoImage.value = imageFile.value)
    saveToStorage(uploadedFile[0], props.imageType)
  }
}

// $: watermark =
const watermark = computed(() => {
  return props.imageType === "bg" ? bgImage.value : logoImage.value
})
const test = () => console.log('test')

</script>
<template>
  <!--  -->
  <div class="dropzone panel" :class="{ dragOver }" @dragenter="dragOver = true" @dragleave="dragOver = false"
    @drop="handleDragDrop" @dragover.prevent :style="`--bg: url(${watermark ? watermark : ''});
                                                        background-size: ${imageType === 'bg' ? 'cover' : 'contain'
      }`">
    <form class="dropzone-form">
      <input class="file-picker" type="file" :id="imageType + 'input'" accept="image/png, image/jpeg, image/webp"
        @change="setFiles" />
      <label class="file-button" :for="imageType + 'input'">{{ imageType === "bg" ? "Background" : "Logo" }} Image</label>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.dropzone {
  block-size: 100%;
  color: var(--gray-4);
  display: flex;
  inline-size: 100%;
  min-block-size: 5rem;
  padding: 0;
  transition: background-color 0.2s var(--ease-in-out-3);
}

.dropzone:after {
  background-image: var(--bg);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: inherit;
  bottom: 0;
  content: "";
  left: 0;
  opacity: 0.2;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
}

.dropzone.dragOver {
  background-color: #ff00ff;
  color: var(--gray-0);
}

.dropzone:hover {
  background: var(--gray-8);
}

.dropzone-form {
  display: flex;
  inline-size: 100%;
  min-block-size: 100%;
  z-index: 2;
}

.file-picker {
  display: none;
}

.file-button {
  align-items: center;
  appearance: none;
  block-size: 100%;
  border: 0;
  display: flex;
  inline-size: 100%;
  justify-content: center;
  text-shadow: 0 0.15rem 0.2rem rgb(0 0 0 / 0.9);
}
</style>
