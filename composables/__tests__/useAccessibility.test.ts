import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useAccessibility } from '../useAccessibility'

// Mock DOM methods
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
})

// Test component that uses the accessibility composable
const TestComponent = defineComponent({
  setup() {
    const accessibility = useAccessibility({
      announceStateChanges: true,
      respectReducedMotion: true,
      enableKeyboardNavigation: true,
      enableFocusManagement: true,
      enableHighContrast: true
    })
    
    return {
      ...accessibility
    }
  },
  template: '<div></div>'
})

describe('useAccessibility', () => {
  let wrapper: any
  let mockMediaQueryList: any

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    
    // Mock MediaQueryList
    mockMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }
    
    mockMatchMedia.mockReturnValue(mockMediaQueryList)
    
    wrapper = mount(TestComponent)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.clearAllMocks()
  })

  describe('Screen Reader Announcements', () => {
    it('should create live region for announcements', async () => {
      await nextTick()
      
      const liveRegion = document.getElementById('accessibility-live-region')
      expect(liveRegion).toBeTruthy()
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite')
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should announce messages to screen readers', async () => {
      await nextTick()
      
      const message = 'Test announcement'
      wrapper.vm.announceToScreenReader(message)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const liveRegion = document.getElementById('accessibility-live-region')
      expect(liveRegion?.textContent).toBe(message)
    })

    it('should announce state changes with context', async () => {
      await nextTick()
      
      const state = 'loading'
      const context = 'Save button'
      wrapper.vm.announceStateChange(state, context)
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const liveRegion = document.getElementById('accessibility-live-region')
      expect(liveRegion?.textContent).toBe('Save button: loading')
    })

    it('should handle assertive announcements', async () => {
      await nextTick()
      
      const message = 'Error occurred'
      wrapper.vm.announceToScreenReader(message, 'assertive')
      
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const liveRegion = document.getElementById('accessibility-live-region')
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive')
      expect(liveRegion?.textContent).toBe(message)
    })
  })

  describe('Focus Management', () => {
    it('should manage focus on elements', async () => {
      const button = document.createElement('button')
      button.textContent = 'Test Button'
      document.body.appendChild(button)
      
      const focusSpy = vi.spyOn(button, 'focus')
      
      wrapper.vm.manageFocus(button)
      await nextTick()
      
      expect(focusSpy).toHaveBeenCalled()
    })

    it('should trap focus within container', () => {
      const container = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      
      container.appendChild(button1)
      container.appendChild(button2)
      document.body.appendChild(container)
      
      const cleanup = wrapper.vm.trapFocus(container)
      
      expect(typeof cleanup).toBe('function')
      
      // Test focus trapping
      const focusSpy = vi.spyOn(button1, 'focus')
      cleanup()
      
      // Cleanup should remove event listeners
      expect(focusSpy).toHaveBeenCalled()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should handle keyboard navigation events', () => {
      const enterHandler = vi.fn()
      const spaceHandler = vi.fn()
      const escapeHandler = vi.fn()
      
      const handlers = {
        Enter: enterHandler,
        Space: spaceHandler,
        Escape: escapeHandler
      }
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' })
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      
      wrapper.vm.handleKeyboardNavigation(enterEvent, handlers)
      wrapper.vm.handleKeyboardNavigation(spaceEvent, handlers)
      wrapper.vm.handleKeyboardNavigation(escapeEvent, handlers)
      
      expect(enterHandler).toHaveBeenCalledWith(enterEvent)
      expect(spaceHandler).toHaveBeenCalledWith(spaceEvent)
      expect(escapeHandler).toHaveBeenCalledWith(escapeEvent)
    })

    it('should ignore unhandled keys', () => {
      const handler = vi.fn()
      const handlers = { Enter: handler }
      
      const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
      wrapper.vm.handleKeyboardNavigation(tabEvent, handlers)
      
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility Preferences', () => {
    it('should detect reduced motion preference', () => {
      mockMediaQueryList.matches = true
      mockMatchMedia.mockReturnValue(mockMediaQueryList)
      
      const result = wrapper.vm.prefersReducedMotion()
      expect(result).toBe(true)
    })

    it('should detect high contrast preference', () => {
      mockMediaQueryList.matches = true
      mockMatchMedia.mockReturnValue(mockMediaQueryList)
      
      const result = wrapper.vm.prefersHighContrast()
      expect(result).toBe(true)
    })

    it('should detect color scheme preference', () => {
      // Mock dark mode preference
      mockMatchMedia.mockImplementation((query) => ({
        matches: query.includes('dark'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))
      
      const result = wrapper.vm.prefersColorScheme()
      expect(result).toBe('dark')
    })
  })

  describe('ARIA Helpers', () => {
    it('should generate comprehensive ARIA labels', () => {
      const base = 'Save button'
      const state = {
        loading: true,
        error: null,
        success: false,
        disabled: false
      }
      
      const result = wrapper.vm.generateAriaLabel(base, state)
      expect(result).toBe('Save button, loading')
    })

    it('should generate ARIA labels with multiple states', () => {
      const base = 'Delete button'
      const state = {
        loading: false,
        error: 'Network error',
        success: false,
        disabled: true,
        expanded: true
      }
      
      const result = wrapper.vm.generateAriaLabel(base, state)
      expect(result).toBe('Delete button, error: Network error, disabled, expanded')
    })

    it('should generate ARIA descriptions', () => {
      const context = 'Form submission'
      const instructions = ['Press Enter to submit', 'Press Escape to cancel']
      
      const result = wrapper.vm.generateAriaDescription(context, instructions)
      expect(result).toBe('Form submission Instructions: Press Enter to submit Press Escape to cancel')
    })
  })

  describe('Color Contrast Utilities', () => {
    it('should check color contrast ratios', () => {
      const result = wrapper.vm.checkColorContrast('#000000', '#ffffff')
      
      expect(result.ratio).toBeGreaterThan(20) // Black on white has very high contrast
      expect(result.passes).toBe(true)
    })

    it('should detect insufficient contrast', () => {
      const result = wrapper.vm.checkColorContrast('#888888', '#999999')
      
      expect(result.ratio).toBeLessThan(4.5)
      expect(result.passes).toBe(false)
    })

    it('should ensure minimum contrast', () => {
      const result = wrapper.vm.ensureMinimumContrast('#888888', '#ffffff')
      
      // Should return a high contrast color
      expect(result).toBe('#000000')
    })

    it('should handle invalid color formats', () => {
      const result = wrapper.vm.checkColorContrast('invalid', '#ffffff')
      
      expect(result.ratio).toBe(0)
      expect(result.passes).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('should cleanup live region on unmount', async () => {
      await nextTick()
      
      // Verify live region exists
      expect(document.getElementById('accessibility-live-region')).toBeTruthy()
      
      wrapper.unmount()
      
      // Live region should be removed
      expect(document.getElementById('accessibility-live-region')).toBeFalsy()
    })
  })
})

describe('useAccessibilityHelpers', () => {
  let wrapper: any

  const TestHelperComponent = defineComponent({
    setup() {
      const { useAccessibilityHelpers } = require('../useAccessibility')
      const helpers = useAccessibilityHelpers()
      
      return {
        ...helpers
      }
    },
    template: '<div></div>'
  })

  beforeEach(() => {
    wrapper = mount(TestHelperComponent)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Button Accessibility Enhancement', () => {
    it('should enhance button accessibility', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)
      
      const label = 'Save changes'
      const state = {
        loading: true,
        disabled: false
      }
      
      wrapper.vm.enhanceButtonAccessibility(button, label, state)
      
      expect(button.getAttribute('aria-label')).toContain('Save changes')
      expect(button.getAttribute('aria-label')).toContain('loading')
      expect(button.getAttribute('aria-busy')).toBe('true')
    })
  })

  describe('Link Accessibility Enhancement', () => {
    it('should enhance external link accessibility', () => {
      const link = document.createElement('a')
      link.textContent = 'External Link'
      document.body.appendChild(link)
      
      wrapper.vm.enhanceLinkAccessibility(link, true, true)
      
      expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      expect(link.getAttribute('aria-label')).toContain('opens in new tab')
    })
  })

  describe('Form Accessibility Enhancement', () => {
    it('should enhance form input accessibility', () => {
      const input = document.createElement('input')
      input.id = 'test-input'
      document.body.appendChild(input)
      
      const label = 'Email address'
      const error = 'Please enter a valid email'
      
      wrapper.vm.enhanceFormAccessibility(input, label, error)
      
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toContain('error')
      
      const errorElement = document.getElementById(`${input.id}-error`)
      expect(errorElement).toBeTruthy()
      expect(errorElement?.textContent).toBe(error)
    })
  })
})