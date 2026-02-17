import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts']
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
      '#app': resolve(__dirname, './tests/mocks/nuxt-mocks.ts'),
      '#imports': resolve(__dirname, './tests/mocks/nuxt-mocks.ts'),
    },
  },
})