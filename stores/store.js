import { defineStore } from "pinia"
export const useOgStore = defineStore("store", {
  state: () => ({
    playing : false,
    recording : false,
    video : false,
    bgImage : "",
    logoImage : "",
    bg : "#1e1e1e",
    bgOpacity : 0.15,
    bgOutro : "#1e1e1e",
    fg : "#eeeeee",
    sizeTitle : 46,
    sizeSubtitle : 30,
    title : "Create a short video for your blog post to share on social media.",
    subtitle : "You can add custom text, colours, your logo and a background image. If you pop your url in the box over there, it will auto-fill the content. Then just click Create Video!"
  }),
})

