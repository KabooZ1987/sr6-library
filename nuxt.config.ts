// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
