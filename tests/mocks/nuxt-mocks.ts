import { vi } from 'vitest'
import { ref } from 'vue'

export const useAsyncData = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    data: ref([]),
    pending: ref(false),
    refresh: vi.fn()
  })
})

export const $fetch = vi.fn().mockResolvedValue([])
export const useHead = vi.fn()
export const useRuntimeConfig = vi.fn(() => ({ public: {} }))
export const defineNuxtComponent = (c: any) => c
