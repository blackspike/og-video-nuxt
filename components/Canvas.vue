<script setup>
import { useOgStore } from "@/stores/store"
import { storeToRefs } from "pinia"
import { fabric } from "fabric"
import anime from "animejs"

const store = useOgStore()
const {
  fg,
  bg,
  subtitle,
  sizeSubtitle,
  title,
  sizeTitle,
  bgOutro,
  bgImage,
  bgOpacity,
  logoImage,
  recording,
  video,
  playing,
} = storeToRefs(store)
const props = defineProps({
  font: Object,
})

let canvas
let titleText
let subtitleText
let mask
let logo
const animTimeline = ref()
const bgAnim = ref()

const canvasSize = ref(640)
const textDefaults = {
  width: canvasSize.value - 100,
  left: 50,
  fill: fg.value,
  lineHeight: 1.1,
  originY: "bottom",
  fontFamily: "Satoshi-Bold",
}
const layers = {
  BG: 0,
  TITLE: 1,
  SUBTITLE: 2,
  MASK: 3,
  LOGO: 4,
}

onMounted(async () => {
  const params = new URLSearchParams(location.search)
  const colorParam = params.get("color")
  colorParam ? (bg.value = "#" + colorParam) : null

  // Create (static) canvas
  canvas = new fabric.StaticCanvas("canvas", {
    backgroundColor: bg.value,
    preserveObjectStacking: true,
  })

  // Set logo image
  // Get logo from local storage
  const localStorageBase64ToBlob = async (data) => {
    const blobFromBase64 = await fetch(data).then((res) => res.blob())
    logoImage.value = URL.createObjectURL(blobFromBase64)
  }

  if (localStorage.getItem("logo")) {
    const logoFromStorage = localStorage.getItem("logo")
    localStorageBase64ToBlob(logoFromStorage)
  } else {
    await fetch("/blackspike-logo.png")
      .then((res) => res.blob())
      .then((blob) => (logoImage.value = URL.createObjectURL(blob)))
  }

  // Set bg image
  await fetch("/temp.webp")
    .then((res) => res.blob())
    .then((blob) => (bgImage.value = URL.createObjectURL(blob)))

  // Bug - logo comes in at the wrong layer so bump it here
  updateLogoImage()
  canvas.renderAll()

  // Subtitle
  subtitleText = new fabric.Textbox(subtitle.value, {
    ...textDefaults,
    top: canvasSize.value - 50,
    fontSize: sizeSubtitle.value,
  })
  canvas.insertAt(subtitleText, layers.SUBTITLE)

  // Title
  titleText = new fabric.Textbox(title.value, {
    ...textDefaults,
    fontSize: sizeTitle.value,
    top: canvasSize.value - 80 - subtitleText.calcTextHeight(),
  })

  canvas.insertAt(titleText, layers.TITLE)

  // Add outro
  mask = new fabric.Rect({
    fill: bgOutro.value,
    width: canvasSize.value + 10,
    height: canvasSize.value + 10,
    left: -5,
    top: -5,
    opacity: 0,
  })
  mask.id = "mask"
  canvas.insertAt(mask, layers.MASK)

  // Update fonts
  canvas.set("fontFamily", props.font)
  canvas.requestRenderAll()

  // Add timeline
  animTimeline.value = anime.timeline({
    autoplay: false,
    update: function () {
      canvas.renderAll()
    },
  })
})

// Reset
const reset = () => {
  console.log("reset")
  playing.value = false

  if (bgAnim.value) {
    bgAnim.value.seek(0)
    bgAnim.value.pause()
  }
  if (animTimeline.value) {
    animTimeline.value.pause()
    animTimeline.value.seek(0)
    animTimeline.value = null
  }

  // titleText.top += 30
  titleText.opacity = 1
  // subtitleText.top += 30
  subtitleText.opacity = 1
  canvas.requestRenderAll()
  const maskReset = canvas.getObjects().find((obj) => obj.id === "mask")
  const logoImageReset = canvas.getObjects().find((obj) => obj.id === "logoImage")
  const bgImageReset = canvas.getObjects().find((obj) => obj.id === "bgImage")
  bgImageReset.left = 0
  maskReset.opacity = 0
  logoImageReset.opacity = 0
}

// Play
const play = () => {
  // Reset opacity
  titleText.opacity = 0
  subtitleText.opacity = 0
  canvas.requestRenderAll()

  // re-init timeline
  animTimeline.value = anime.timeline({
    update: function () {
      canvas.renderAll()
    },
  })

  const maskAnim = canvas.getObjects().find((obj) => obj.id === "mask")
  const logoImageAnim = canvas.getObjects().find((obj) => obj.id === "logoImage")
  const bgImageAnim = canvas.getObjects().find((obj) => obj.id === "bgImage")

  const orig = {
    logoScaleX: logoImageAnim.scaleX,
    logoScaleY: logoImageAnim.scaleY,
    titleTextTop: titleText.top,
    subtitleTextTop: subtitleText.top,
  }

  // TextTyper
  let interval
  const count = title.value.length
  const typingPause = 20
  let typingTime = typingPause * count

  // Time to read subtitle
  const words = subtitle.value.split(" ").length
  const wordPerSec = 200 / 60 // av reading speed 200 wpm / 60 s
  const subtitleReadingTime = Math.floor(Math.round(words * wordPerSec * 100))

  bgAnim.value = anime({
    targets: bgImageAnim,
    left: [0, canvasSize.value - bgImageAnim.aCoords.tr.x],
    duration: 30000,
    loop: true,
    easing: "easeInOutQuad",
    direction: "alternate",
  })

  titleText.set("text", "")
  // Timeline
  animTimeline.value
    .add({
      targets: titleText,
      opacity: 1,
      top: "-=30",
      easing: "easeOutQuad",
      duration: 1000,
      delay: 1000,
      complete: () => console.log("complete 1 titleText opacity"),
    })
    .add(
      {
        targets: titleText,
        easing: "easeOutQuad",
        duration: 1000,

        begin: () => {
          titleText.set("text", "")
          let cur = 0
          let t = ""
          interval = setInterval(() => {
            if (cur >= count) return
            titleText.set("text", (t += title.value[cur]))
            cur++
          }, typingPause)
        },
        complete: () => console.log("complete 2 titleText typing"),
      },
      `-=1000`
    )
    .add({
      targets: subtitleText,
      easing: "easeOutQuad",
      duration: 1000,
      opacity: [0, 1],
      delay: 500,
      top: "-=30",
      complete: () => console.log("complete 3 subtitleText opacity"),
    })
    .add(
      {
        targets: maskAnim,
        opacity: [0, 1],
        easing: "linear",
        duration: 250,
        complete: () => console.log("complete 4 mask opacity"),
      },
      `+=${subtitleReadingTime / 1.2}`
    )
    .add({
      targets: logoImageAnim,
      opacity: [0, 1],
      scaleX: logoImageAnim.scaleX + 0.1,
      scaleY: logoImageAnim.scaleY + 0.1,
      easing: "easeInOutSine",
      duration: 250,
      delay: 250,
      complete: () => console.log({ logoImageAnim, state: "complete 5 logoImageAnim scale opacity in" }),
    })
    .add({
      targets: logoImageAnim,
      opacity: [1, 0],
      scaleX: logoImageAnim.scaleX + 0.2,
      scaleY: logoImageAnim.scaleY + 0.2,
      easing: "easeOutCubic",
      duration: 250,
      delay: 2000,
      complete: () => console.log("complete 6 logoImageAnim scale opacity out"),
    })
    .add({
      complete: () => {
        console.log("complete 7 hide all")
        // Reset bg
        bgAnim.value.seek(0)
        bgAnim.value.pause()
        // fade text
        titleText.opacity = 0
        subtitleText.opacity = 0
        subtitleText.set("top", orig.subtitleTextTop)
        titleText.set("top", orig.titleTextTop)
      },
    })
    .add({
      targets: maskAnim,
      opacity: 0,
      duration: 1000,
      easing: "linear",
      complete: () => {
        // Reset
        console.log("complete 8 fade mask out final")
        animTimeline.value = null
        clearInterval(interval)
        logoImageAnim.scaleX = orig.logoScaleX
        logoImageAnim.scaleY = orig.logoScaleY
        reset()
      },
    })
}

// Update title text

watch(title, () => updateTitle())
watch(sizeTitle, () => updateTitle())
watch(subtitle, () => updateSubtitle())
watch(sizeSubtitle, () => updateSubtitle())
watch(fg, () => updateFg())

function updateTitle() {
  if (!titleText) return
  titleText.set("text", title.value)
  titleText.set("fontSize", sizeTitle.value)
  canvas.requestRenderAll()
}

function updateSubtitle() {

  subtitleText.set("text", subtitle.value)
  subtitleText.set("fontSize", sizeSubtitle.value)

  titleText.set("top", canvasSize.value - 80 - subtitleText.calcTextHeight())
  canvas.requestRenderAll()
}

function updateFg() {
  if (!titleText || !subtitleText) return
  titleText.set("fill", fg.value)
  subtitleText.set("fill", fg.value)
  canvas.requestRenderAll()
}

// Update background
watch(bg, () => updateBg())

function updateBg() {
  if (!canvas) return
  canvas.set("backgroundColor", bg.value)
  mask.set("fill", bg.value)
  canvas.requestRenderAll()
}

// // Update background image

watch(bgImage, () => updateBgImage())

watch(bgOpacity, () => updateBgImageOpacity())

function updateBgImage() {
  if (!canvas || !bgImage.value) return
  const currentImage = canvas.getObjects().find((obj) => obj.id === "bgImage")
  canvas.remove(currentImage)
  canvas.requestRenderAll()

  fabric.Image.fromURL(bgImage.value, (img) => {
    img.set({ opacity: bgOpacity.value })
    img.scaleToHeight(canvasSize.value)
    img.id = "bgImage"
    canvas.insertAt(img, layers.BG)
  })
}

function updateBgImageOpacity() {
  if (!canvas) return
  const currentImage = canvas.getObjects().find((obj) => obj.id === "bgImage")

  if (currentImage) {
    currentImage.set("opacity", bgOpacity.value)
    canvas.requestRenderAll()
  }
}

// Update background image
watch(logoImage, () => updateLogoImage())

function updateLogoImage() {
  if (!canvas || !logoImage.value) return
  const currentImage = canvas.getObjects().find((obj) => obj.id === "logoImage")
  canvas.remove(currentImage)

  fabric.Image.fromURL(logoImage.value, (img) => {
    img.set({
      originX: "center",
      originY: "center",
      opacity: 0,
    })
    img.scaleToWidth(200)
    img.id = "logoImage"
    canvas.centerObject(img)
    canvas.insertAt(img, layers.LOGO)
  })
}

// Record
const record = async () => {
  const format = MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm"
  play()
  video.value = null
  console.log("record called")

  const canvas = document.getElementById("canvas")
  const videoStream = canvas.captureStream(60)
  const mediaRecorder = new MediaRecorder(videoStream, {
    mimeType: format,
    videoBitsPerSecond: 5000000, // Double the default quality from 2.5Mbps to 5Mbps
  })

  let chunks = []

  mediaRecorder.ondataavailable = function (e) {
    chunks.push(e.data)
  }

  mediaRecorder.onstop = function (e) {
    const blob = new Blob(chunks, {
      type: format,
    })
    chunks = []
    const videoURL = URL.createObjectURL(blob)
    video.value = videoURL
  }
  mediaRecorder.ondataavailable = function (e) {
    chunks.push(e.data)
  }

  mediaRecorder.start()
  setTimeout(function () {
    mediaRecorder.stop()
    recording.value = false
    reset()
  }, animTimeline.value.duration)
}

defineExpose({
  reset,
  play,
  record,
})
</script>

<template>
  <canvas :width="canvasSize" :height="canvasSize" :style="`--canvasSize: {canvasSize}px`" id="canvas" />
</template>

<style lang="scss" scoped>
canvas {
  aspect-ratio: var(--canvasSize) / var(--canvasSize);
}
</style>
