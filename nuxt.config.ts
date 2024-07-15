// https://nuxt.com/docs/api/configuration/nuxt-config
// const laraPath = path.resolve(__dirname, 'presets', 'lara');
import Lara from '@primevue/themes/lara';


export default defineNuxtConfig({

  devtools: { enabled: true },

  devServer:{
    port: 3010,
    host: "0.0.0.0"
  },

  colorMode: {
    preference: "dark",
  },

  modules: ['@primevue/nuxt-module', 'formidable'],
  css: ['~/assets/css/main.scss'],

  primevue: {
    options: {
        theme: {
            preset: Lara,
            options: {
              darkModeSelector: '.dark',
          }
        }
    }
},

  components: [
    {
      path: "~/components",
      exclude: ["Editor", "Chart"],
      pathPrefix: false,
    },
  ],

  compatibilityDate: "2024-07-14",
});