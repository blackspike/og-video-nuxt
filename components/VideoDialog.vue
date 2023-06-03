<script setup>
import { useOgStore } from "@/stores/store"
import { storeToRefs } from "pinia"
const store = useOgStore()
const { video } = storeToRefs(store)

const dialog = ref()
const videoEl = ref()

onMounted(() => {
  dialog.value = document.getElementById("dialog-video")
})

watch(video, () => toggleDialog())

const toggleDialog = () => {
  if (!dialog.value || !video.value) return
  dialog.value.showModal()
  videoEl.value.src = video.value
}
</script>

<template>
  <dialog id="dialog-video" class="panel">
    <form method="dialog" class="content">
      <video ref="videoEl" autoplay controls muted playsinline>
        <track kind="captions" />
      </video>
      <footer class="vstack gap-3 space">
        <a class="btn save" :href="video" download="og-video">Download</a>
        <button value="cancel">Cancel</button>
      </footer>
    </form>
  </dialog>
</template>


<style scoped>
dialog {
  max-height: 80vh;
  margin: auto;
  border: none;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}

video {
  object-fit: contain;
  height: 100%;
  width: auto;
  max-height: 420px;
  border-radius: var(--radius-2);
}

.content {
  align-items: center;
  display: grid;
  gap: var(--size-5);
  grid-template-areas: "video content";
  grid-template-columns: 1fr auto;
}

footer {
  height: 100%;
}

footer button {
  width: 100%;
}

.save {
  background-color: var(--brand);
}
</style>
