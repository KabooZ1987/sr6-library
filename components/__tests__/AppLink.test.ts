import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLink from '../AppLink.vue'

// Mock Nuxt components and imports
const pushMock = vi.fn()
const resolveMock = vi.fn((to) => ({ href: typeof to === 'string' ? to : '/resolved-path' }))

vi.mock('#app', () => ({
  useAsyncData: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({ public: {} }))
}))

vi.mock('#imports', () => ({
  useRequestURL: vi.fn(() => ({ origin: 'https://example.com' })),
  useRouter: vi.fn(() => ({
    push: pushMock,
    resolve: resolveMock
  })),
  useRoute: vi.fn(() => ({ path: '/' }))
}))

// Mock window.location
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'https://example.com',
      href: 'https://example.com'
    },
    writable: true
  })
}

describe('AppLink', () => {
  let wrapper: any
  
  const createWrapper = (props = {}, slots = { default: 'Link Text' }, attrs = {}) => {
    return mount(AppLink, {
      props,
      slots,
      attrs,
      global: {
        stubs: {
          NuxtLink: true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Internal Link Detection', () => {
    it('should identify internal paths starting with /', () => {
      wrapper = createWrapper({ to: '/internal-page' })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('/internal-page')
    })

    it('should identify relative paths', () => {
      wrapper = createWrapper({ to: './relative-page' })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('./relative-page')
    })

    it('should identify same-origin URLs', () => {
      wrapper = createWrapper({ to: 'https://example.com/same-origin' })
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('https://example.com/same-origin')
    })
  })

  describe('External Link Detection', () => {
    it('should use anchor tag for external URLs', () => {
      wrapper = createWrapper({ to: 'https://external.com' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('https://external.com')
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
      expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer')
    })

    it('should use anchor tag for mailto links', () => {
      wrapper = createWrapper({ to: 'mailto:test@example.com' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('mailto:test@example.com')
    })
  })

  describe('Target and Rel Attributes', () => {
    it('should auto-set target="_blank" for external links', () => {
      wrapper = createWrapper({ to: 'https://external.com' })
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
    })

    it('should respect custom target attribute', () => {
      wrapper = createWrapper({ 
        to: 'https://external.com',
        target: '_self'
      })
      expect(wrapper.find('a').attributes('target')).toBe('_self')
    })
  })

  describe('Accessibility Attributes', () => {
    it('should set aria-label for external links', () => {
      wrapper = createWrapper({ to: 'https://external.com' })
      expect(wrapper.find('a').attributes('aria-label')).toBe('Opens in new tab')
    })

    it('should set tabindex="0" by default', () => {
      wrapper = createWrapper({ to: '/internal' })
      expect(wrapper.find('a').attributes('tabindex')).toBe('0')
    })
  })

  describe('Click Handling', () => {
    it('should call router.push on valid internal click', async () => {
      wrapper = createWrapper({ to: '/internal' })
      await wrapper.find('a').trigger('click', { button: 0 })
      expect(pushMock).toHaveBeenCalledWith('/internal')
    })

    it('should prevent navigation when disabled', async () => {
      wrapper = createWrapper({ 
        to: '/internal',
        disabled: true
      })
      
      const event = {
        button: 0,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      }
      
      await wrapper.vm.handleClick(event)
      
      expect(event.preventDefault).toHaveBeenCalled()
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Space key press', async () => {
      wrapper = createWrapper({ to: '/internal' })
      const link = wrapper.find('a')
      
      // Use a real click on the element to simulate Space behavior in my implementation
      await link.trigger('keydown', { key: ' ' })
      
      // My implementation calls target.click() on Space
      expect(pushMock).toHaveBeenCalledWith('/internal')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty URL', () => {
      wrapper = createWrapper({ to: '' })
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('should prefer "to" prop over "href" prop', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        href: 'https://external.com'
      })
      expect(wrapper.find('a').attributes('href')).toBe('/internal')
    })
  })
})