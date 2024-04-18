// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer:{
    port: 3010,
    host: "0.0.0.0"
  },
  colorMode: {
    preference: "dark",
  },
  modules: ["@nuxt/ui", "nuxt-icon"],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
});
