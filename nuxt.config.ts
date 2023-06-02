// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  modules: ["@pinia/nuxt"],

  // Css
  css: ["@/assets/css/main.scss"],

  // Head
  app: {
    head: {
      title: "OG Video | Create a short video of your blog post or web page!",
      htmlAttrs: {
        lang: "en",
      },

      bodyAttrs: {
        id: "top",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { hid: "author", name: "author", content: "blackspike.com" },
        { hid: "theme-color", name: "author", content: "#030507" },
        {
          hid: "description",
          name: "description",
          content:
            "A lil web app for creating short videos of your web page social meta, for promoting posts on social media",
          key: "desc",
        },
        {
          hid: "og:title",
          name: "og:title",
          content:
            "OG Video | Create a short video of your blog post or web page!",
          key: "ogtitle",
        },
        {
          hid: "og:description",
          name: "og:description",
          content:
            "A lil web app for creating short videos of your web page social meta, for promoting posts on social media",
          key: "ogdesc",
        },
        {
          hid: "og:site_name",
          name: "og:site_name",
          content: "OG Video",
        },
        { hid: "og:type", name: "og:type", content: "website" },
        {
          hid: "og:url",
          name: "og:url",
          content: "https://ogvideo.app/",
          key: "ogurl",
        },
        {
          hid: "og:image",
          name: "og:image",
          content: "https://ogvideo.app/1200x630.jpg",
          key: "ogimage",
        },
        {
          hid: "twitter:image",
          name: "twitter:image",
          content: "https://ogvideo.app/1200x630.jpg",
          key: "twimage",
        },
        {
          hid: "twitter:card",
          name: "twitter:card",
          content: "summary_large_image",
        },
      ],
      link: [
        { rel: "manifest", href: "/manifest.json" },
        { rel: "icon", href: "/favicon.svg" },
      ],
    },
  },
})
