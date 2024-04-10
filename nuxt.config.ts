// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  css: [
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  modules: [
    '@nuxt/ui'
  ],
  
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ]



});
