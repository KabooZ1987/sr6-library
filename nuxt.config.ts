// https://nuxt.com/docs/api/configuration/nuxt-config
// const laraPath = path.resolve(__dirname, 'presets', 'lara');
import Aura from '@primeuix/themes/aura';
import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({

  devtools: { enabled: true },

  devServer:{
    port: 3010,
    host: "0.0.0.0"
  },

  modules: ['@primevue/nuxt-module', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.scss'],

  primevue: {
    options: {
        theme:
            {
            preset: Aura,
            options: {
              darkModeSelector: '.dark',
          }
        }
    }
},

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  compatibilityDate: "2025-06-06",
});