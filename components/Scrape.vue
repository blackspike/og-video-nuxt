<script setup>
import { useOgStore } from "@/stores/store"
import { storeToRefs } from "pinia"
const store = useOgStore()
const { title, bgImage, subtitle, bg } = storeToRefs(store)

const fetchLoading = ref()
const url = ref('')

const scraper = async () => {
  fetchLoading.value = true

  const res = await fetch(`/.netlify/functions/scrape?url=${url.value}`, {
    method: "POST",
    body: JSON.stringify({ url: url.value }),
  })
  const meta = await res.json()

  if (res.ok) {
    title.value = meta.title ? meta.title : title.value
    subtitle.value = meta.subtitle ? meta.subtitle : subtitle.value
    meta.bg ? (bg.value = meta.bg) : null

    if (meta.bgImage) {
      const blobFromBase64 = await fetch(
        `data:'application/octet-stream';base64,${meta.bgImage}`
      ).then((res) => res.blob())
      bgImage.value = URL.createObjectURL(blobFromBase64)
    }
    fetchLoading.value = false
  } else {
    fetchLoading.value = false
    throw new Error(meta)
  }
}

onMounted(() => {
  const params = new URLSearchParams(location.search)
  const urlParam = params.get("url")

  if (urlParam) {
    url.value = urlParam
    scraper()
  }
})
</script>

<template>
  <form class="scraper hstack gap-2" @submit.prevent="scraper" :class="{ fetchLoading }">
    <input type="url" v-model="url" placeholder="Your webpage URL" />

    <button class="fetch-btn" @click="scraper">
      {{ fetchLoading ? 'Fetching…' : 'Fetch' }}
    </button>
  </form>
</template>
<style>
.fetchLoading {
  pointer-events: none;
  opacity: 0.3;
  transition: all 0.3s var(--ease-in-out-3);
}

input {
  font-size: var(--font-size-2);
}

input:invalid {
  outline: 2px solid orangered;
}

.fetch-btn {
  min-width: 7rem;
}
</style>
