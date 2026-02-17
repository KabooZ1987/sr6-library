import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppLink from '../AppLink.vue'

// Mock NuxtLink component
const NuxtLinkMock = {
  name: 'NuxtLink',
  props: ['to'],
  template: '<a :to="to"><slot /></a>'
}

// Mock window.location
const mockLocation = {
  origin: 'https://example.com',
  href: 'https://example.com'
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('AppLink', () => {
  let wrapper: any
  
  const createWrapper = (props = {}, slots = { default: 'Link Text' }) => {
    return mount(AppLink, {
      props,
      slots,
      global: {
        components: {
          NuxtLink: NuxtLinkMock
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Internal Link Detection', () => {
    it('should use NuxtLink for internal paths starting with /', () => {
      wrapper = createWrapper({ to: '/internal-page' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('to')).toBe('/internal-page')
    })

    it('should use NuxtLink for relative paths', () => {
      wrapper = createWrapper({ to: './relative-page' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('to')).toBe('./relative-page')
    })

    it('should use NuxtLink for parent relative paths', () => {
      wrapper = createWrapper({ to: '../parent-page' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('to')).toBe('../parent-page')
    })

    it('should use NuxtLink for same-origin URLs', () => {
      wrapper = createWrapper({ to: 'https://example.com/same-origin' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('to')).toBe('https://example.com/same-origin')
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

    it('should use anchor tag for tel links', () => {
      wrapper = createWrapper({ to: 'tel:+1234567890' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('tel:+1234567890')
    })

    it('should use anchor tag for hash links', () => {
      wrapper = createWrapper({ to: '#section1' })
      
      expect(wrapper.find('a').exists()).toBe(true)
      expect(wrapper.find('a').attributes('href')).toBe('#section1')
    })
  })

  describe('Target and Rel Attributes', () => {
    it('should auto-set target="_blank" for external links', () => {
      wrapper = createWrapper({ to: 'https://external.com' })
      
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
    })

    it('should auto-set rel="noopener noreferrer" for external links with target="_blank"', () => {
      wrapper = createWrapper({ to: 'https://external.com' })
      
      expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer')
    })

    it('should respect custom target attribute', () => {
      wrapper = createWrapper({ 
        to: 'https://external.com',
        target: '_self'
      })
      
      expect(wrapper.find('a').attributes('target')).toBe('_self')
    })

    it('should respect custom rel attribute', () => {
      wrapper = createWrapper({ 
        to: 'https://external.com',
        rel: 'custom-rel'
      })
      
      expect(wrapper.find('a').attributes('rel')).toBe('custom-rel')
    })

    it('should not set target for internal links', () => {
      wrapper = createWrapper({ to: '/internal' })
      
      expect(wrapper.find('a').attributes('target')).toBeUndefined()
    })

    it('should not set target for hash links', () => {
      wrapper = createWrapper({ to: '#section' })
      
      expect(wrapper.find('a').attributes('target')).toBeUndefined()
    })
  })

  describe('Accessibility Attributes', () => {
    it('should set aria-label for external links', () => {
      wrapper = createWrapper({ to: 'https://external.com' })
      
      expect(wrapper.find('a').attributes('aria-label')).toBe('Opens in new tab')
    })

    it('should respect custom aria-label', () => {
      wrapper = createWrapper({ 
        to: 'https://external.com',
        ariaLabel: 'Custom label'
      })
      
      expect(wrapper.find('a').attributes('aria-label')).toBe('Custom label')
    })

    it('should set tabindex="0" by default', () => {
      wrapper = createWrapper({ to: '/internal' })
      
      expect(wrapper.find('a').attributes('tabindex')).toBe('0')
    })

    it('should set tabindex="-1" when disabled', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        disabled: true
      })
      
      expect(wrapper.find('a').attributes('tabindex')).toBe('-1')
    })
  })

  describe('CSS Classes', () => {
    it('should apply string classes', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        class: 'custom-class'
      })
      
      expect(wrapper.find('a').classes()).toContain('custom-class')
    })

    it('should apply array classes', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        class: ['class1', 'class2']
      })
      
      expect(wrapper.find('a').classes()).toContain('class1')
      expect(wrapper.find('a').classes()).toContain('class2')
    })

    it('should apply object classes conditionally', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        class: { 'active': true, 'inactive': false }
      })
      
      expect(wrapper.find('a').classes()).toContain('active')
      expect(wrapper.find('a').classes()).not.toContain('inactive')
    })

    it('should add disabled class when disabled', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        disabled: true
      })
      
      expect(wrapper.find('a').classes()).toContain('app-link--disabled')
    })
  })

  describe('Click Handling', () => {
    it('should emit click event on valid click', async () => {
      wrapper = createWrapper({ to: '/internal' })
      
      await wrapper.find('a').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should prevent click when disabled', async () => {
      wrapper = createWrapper({ 
        to: '/internal',
        disabled: true
      })
      
      const clickEvent = new MouseEvent('click')
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')
      
      await wrapper.vm.handleClick(clickEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should emit error for invalid URLs', async () => {
      wrapper = createWrapper({ to: 'invalid://malformed url with spaces' })
      
      const clickEvent = new MouseEvent('click')
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')
      
      await wrapper.vm.handleClick(clickEvent)
      
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toBeInstanceOf(Error)
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle Enter key press', async () => {
      wrapper = createWrapper({ to: '/internal' })
      
      await wrapper.find('a').trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('should handle Space key press', async () => {
      wrapper = createWrapper({ to: '/internal' })
      
      await wrapper.find('a').trigger('keydown', { key: ' ' })
      
      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('should ignore other keys', async () => {
      wrapper = createWrapper({ to: '/internal' })
      
      await wrapper.find('a').trigger('keydown', { key: 'Tab' })
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('should not handle keyboard events when disabled', async () => {
      wrapper = createWrapper({ 
        to: '/internal',
        disabled: true
      })
      
      await wrapper.find('a').trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('URL Validation', () => {
    it('should validate relative paths as valid', () => {
      expect(wrapper?.vm?.isValidUrl('/path')).toBe(true)
      expect(wrapper?.vm?.isValidUrl('./path')).toBe(true)
      expect(wrapper?.vm?.isValidUrl('../path')).toBe(true)
    })

    it('should validate hash links as valid', () => {
      wrapper = createWrapper({ to: '/internal' })
      expect(wrapper.vm.isValidUrl('#section')).toBe(true)
    })

    it('should validate special protocols as valid', () => {
      wrapper = createWrapper({ to: '/internal' })
      expect(wrapper.vm.isValidUrl('mailto:test@example.com')).toBe(true)
      expect(wrapper.vm.isValidUrl('tel:+1234567890')).toBe(true)
    })

    it('should validate full URLs as valid', () => {
      wrapper = createWrapper({ to: '/internal' })
      expect(wrapper.vm.isValidUrl('https://example.com')).toBe(true)
      expect(wrapper.vm.isValidUrl('http://example.com')).toBe(true)
    })

    it('should invalidate malformed URLs', () => {
      wrapper = createWrapper({ to: '/internal' })
      expect(wrapper.vm.isValidUrl('invalid://malformed url')).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty URL', () => {
      wrapper = createWrapper({ to: '' })
      
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('should handle undefined URL', () => {
      wrapper = createWrapper({})
      
      expect(wrapper.find('span').exists()).toBe(true)
    })

    it('should prefer "to" prop over "href" prop', () => {
      wrapper = createWrapper({ 
        to: '/internal',
        href: 'https://external.com'
      })
      
      expect(wrapper.find('a').attributes('to')).toBe('/internal')
    })

    it('should handle URL parsing errors gracefully', () => {
      // Mock URL constructor to throw error
      const originalURL = global.URL
      global.URL = vi.fn().mockImplementation(() => {
        throw new Error('Invalid URL')
      })
      
      wrapper = createWrapper({ to: 'some-path' })
      
      // Should still render as internal link when URL parsing fails
      expect(wrapper.find('a').exists()).toBe(true)
      
      // Restore original URL constructor
      global.URL = originalURL
    })
  })

  describe('Slot Content', () => {
    it('should render slot content', () => {
      wrapper = createWrapper({ to: '/internal' }, { default: 'Custom Link Text' })
      
      expect(wrapper.text()).toBe('Custom Link Text')
    })

    it('should render complex slot content', () => {
      wrapper = mount(AppLink, {
        props: { to: '/internal' },
        slots: {
          default: '<span class="icon">🔗</span> Link with Icon'
        },
        global: {
          components: {
            NuxtLink: NuxtLinkMock
          }
        }
      })
      
      expect(wrapper.html()).toContain('<span class="icon">🔗</span> Link with Icon')
    })
  })
})