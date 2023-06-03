<script setup>
import FontFaceObserver from "fontfaceobserver"
import { useOgStore } from "@/stores/store"
const store = useOgStore()

const font = ref()
const fontLoaded = ref(false)

onMounted(async () => {
  font.value = new FontFaceObserver("Satoshi-Bold")
  await font.value.load().then(() => (fontLoaded.value = true))
  fontLoaded.value = true
})

const canvas = ref()
const play = () => canvas.value.play()
const reset = () => canvas.value.reset()
const record = () => canvas.value.record()
</script>

<template>
  <client-only>
    <main>
      <div class="canvas">
        <Canvas v-if="fontLoaded" :font="font" ref="canvas" />
        <Spinner v-else />
      </div>
      <div class="controls" v-if="fontLoaded">
        <Controls @play="play" @reset="reset" @record="record" />
      </div>
    </main>
  </client-only>

  <VideoDialog />
</template>

<style lang="scss" scoped>
main {
  margin: auto;
  display: grid;
  gap: var(--size-5) var(--size-1);
  padding: var(--size-5);
  display: grid;
  overflow-x: hidden;
  grid-template-areas: "canvas" "controls";
  display: contents;
}

@media screen and (min-width: 75rem) {
  main {
    display: grid;
    grid-template-areas: "canvas controls";
    justify-content: center;
    gap: 0;
    height: 100%;
    align-items: center;
  }
}

.controls {
  grid-area: controls;
  margin: 1.5vw;
}

.canvas {
  border-radius: var(--radius-2);
  overflow: hidden;
  grid-area: canvas;
  margin: 1.5vw;
  align-self: center;
  justify-self: center;
}
</style>
