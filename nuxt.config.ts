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
  modules: ["@nuxt/ui", "nuxt-icon", 'nuxt-primevue'],
  css: ['~/assets/css/main.scss'],
  primevue: {
    options: {
      unstyled: true
    },
    importPT: {  as: 'Lara', from: require.resolve(__dirname + '/presets/lara/') }
  },
  components: [
    {
      path: "~/components",
      exclude: ["Editor", "Chart"],
      pathPrefix: false,
    },
  ],
});
