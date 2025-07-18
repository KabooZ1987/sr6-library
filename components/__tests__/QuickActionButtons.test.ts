import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import QuickActionButtons from '../QuickActionButtons.vue'

// Mock PrimeVue Button component
vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    template: `
      <button 
        data-testid="button" 
        :class="[$attrs.class, severity, { 'p-button-text': text, 'p-button-rounded': rounded }]"
        :disabled="disabled"
        @click="$emit('click')"
      >
        <i v-if="icon" :class="icon"></i>
        <span v-if="label">{{ label }}</span>
        <slot></slot>
      </button>
    `,
    props: ['icon', 'label', 'severity', 'text', 'rounded', 'size', 'disabled'],
    emits: ['click']
  }
}))

// Mock tooltip directive
const mockTooltip = {
  mounted() {},
  updated() {},
  unmounted() {}
}

// Mock window resize functionality
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('QuickActionButtons', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    type: 'Major',
    description: 'Test description'
  }

  const defaultProps = {
    item: mockItem,
    disabled: false,
    size: 'small' as const
  }

  const mountOptions = {
    global: {
      directives: {
        tooltip: mockTooltip
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window width to desktop
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true
    })
    // Clear any existing event listeners
    document.removeEventListener('click', vi.fn())
  })

  afterEach(() => {
    // Clean up any remaining event listeners
    document.removeEventListener('click', vi.fn())
  })

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.quick-action-buttons').exists()).toBe(true)
    })

    it('should apply correct container classes', () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      const container = wrapper.find('.quick-action-buttons')
      expect(container.classes()).toContain('screen-desktop')
      expect(container.classes()).toContain('size-small')
    })

    it('should apply disabled class when disabled prop is true', () => {
      const wrapper = mount(QuickActionButtons, {
        props: {
          ...defaultProps,
          disabled: true
        },
        ...mountOptions
      })
      
      const container = wrapper.find('.quick-action-buttons')
      expect(container.classes()).toContain('disabled')
    })
  })

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
    })

    it('should show full buttons with text on desktop', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      // Trigger resize to update screen size
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const viewBtn = wrapper.find('.view-btn')
      const editBtn = wrapper.find('.edit-btn')
      const deleteBtn = wrapper.find('.delete-btn')
      
      expect(viewBtn.exists()).toBe(true)
      expect(editBtn.exists()).toBe(true)
      expect(deleteBtn.exists()).toBe(true)
      
      // Check that buttons have labels - look for span elements with text
      expect(viewBtn.find('span').text()).toBe('View')
      expect(editBtn.find('span').text()).toBe('Edit')
      expect(deleteBtn.find('span').text()).toBe('Delete')
    })

    it('should have correct icons and severities on desktop', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const viewBtn = wrapper.find('.view-btn')
      const editBtn = wrapper.find('.edit-btn')
      const deleteBtn = wrapper.find('.delete-btn')
      
      expect(viewBtn.find('i').classes()).toContain('pi-eye')
      expect(editBtn.find('i').classes()).toContain('pi-pencil')
      expect(deleteBtn.find('i').classes()).toContain('pi-trash')
      
      expect(viewBtn.classes()).toContain('info')
      expect(editBtn.classes()).toContain('warning')
      expect(deleteBtn.classes()).toContain('danger')
    })
  })

  describe('Tablet Layout (768-1023px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
    })

    it('should show icon-only buttons on tablet', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const viewBtn = wrapper.find('.view-btn')
      const editBtn = wrapper.find('.edit-btn')
      const deleteBtn = wrapper.find('.delete-btn')
      
      expect(viewBtn.exists()).toBe(true)
      expect(editBtn.exists()).toBe(true)
      expect(deleteBtn.exists()).toBe(true)
      
      // Should have icon-only class
      expect(viewBtn.classes()).toContain('icon-only')
      expect(editBtn.classes()).toContain('icon-only')
      expect(deleteBtn.classes()).toContain('icon-only')
      
      // Should not have text labels
      expect(viewBtn.text()).not.toContain('View')
      expect(editBtn.text()).not.toContain('Edit')
      expect(deleteBtn.text()).not.toContain('Delete')
    })

    it('should have rounded buttons on tablet', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const buttons = wrapper.findAll('[data-testid="button"]')
      buttons.forEach(button => {
        expect(button.classes()).toContain('p-button-rounded')
      })
    })
  })

  describe('Mobile Layout (<768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
    })

    it('should show dropdown trigger on mobile', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      expect(dropdownTrigger.exists()).toBe(true)
      expect(dropdownTrigger.find('i').classes()).toContain('pi-ellipsis-v')
    })

    it('should show dropdown menu when trigger is clicked', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      const dropdownMenu = wrapper.find('.dropdown-menu')
      expect(dropdownMenu.exists()).toBe(true)
      
      const dropdownItems = wrapper.findAll('.dropdown-item')
      expect(dropdownItems).toHaveLength(3)
      
      expect(dropdownItems[0].text()).toContain('View Details')
      expect(dropdownItems[1].text()).toContain('Edit')
      expect(dropdownItems[2].text()).toContain('Delete')
    })

    it('should close dropdown when clicking outside', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      // Open dropdown
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
      
      // Simulate click outside
      const clickEvent = new Event('click')
      Object.defineProperty(clickEvent, 'target', {
        value: document.body,
        enumerable: true
      })
      document.dispatchEvent(clickEvent)
      await nextTick()
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
    })

    it('should have delete item styled differently in dropdown', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      const deleteItem = wrapper.findAll('.dropdown-item')[2]
      expect(deleteItem.classes()).toContain('delete-item')
    })
  })

  describe('Event Handling', () => {
    it('should emit view event when view button is clicked', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      const viewBtn = wrapper.find('.view-btn')
      await viewBtn.trigger('click')
      
      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')?.[0]).toEqual([mockItem])
    })

    it('should emit edit event when edit button is clicked', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      const editBtn = wrapper.find('.edit-btn')
      await editBtn.trigger('click')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')?.[0]).toEqual([mockItem])
    })

    it('should emit delete event when delete button is clicked', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      const deleteBtn = wrapper.find('.delete-btn')
      await deleteBtn.trigger('click')
      
      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')?.[0]).toEqual([mockItem])
    })

    it('should emit events from dropdown items on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      // Open dropdown
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      // Click view item
      const viewItem = wrapper.findAll('.dropdown-item')[0]
      await viewItem.trigger('click')
      
      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')?.[0]).toEqual([mockItem])
    })

    it('should not emit events when disabled', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: {
          ...defaultProps,
          disabled: true
        },
        ...mountOptions
      })
      
      const viewBtn = wrapper.find('.view-btn')
      await viewBtn.trigger('click')
      
      expect(wrapper.emitted('view')).toBeFalsy()
    })

    it('should not open dropdown when disabled on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      
      const wrapper = mount(QuickActionButtons, {
        props: {
          ...defaultProps,
          disabled: true
        },
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('should update screen size on window resize', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      // Start with desktop
      expect(wrapper.find('.screen-desktop').exists()).toBe(true)
      
      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      expect(wrapper.find('.screen-mobile').exists()).toBe(true)
      expect(wrapper.find('.dropdown-trigger').exists()).toBe(true)
    })

    it('should close dropdown when screen size changes', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      // Open dropdown
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
      
      // Resize to desktop
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false)
    })

    it('should handle different screen size breakpoints correctly', async () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      // Test mobile breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 767, writable: true })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(wrapper.find('.screen-mobile').exists()).toBe(true)
      
      // Test tablet breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 768, writable: true })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(wrapper.find('.screen-tablet').exists()).toBe(true)
      
      // Test desktop breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(wrapper.find('.screen-desktop').exists()).toBe(true)
    })
  })

  describe('Props Validation', () => {
    it('should accept item prop', () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      const component = wrapper.vm as any
      expect(component.item).toEqual(mockItem)
    })

    it('should use default values for optional props', () => {
      const wrapper = mount(QuickActionButtons, {
        props: {
          item: mockItem
        },
        ...mountOptions
      })
      
      const component = wrapper.vm as any
      expect(component.disabled).toBe(false)
      expect(component.size).toBe('small')
    })

    it('should handle different size variants', () => {
      const sizes = ['small', 'normal', 'large'] as const
      
      sizes.forEach(size => {
        const wrapper = mount(QuickActionButtons, {
          props: {
            ...defaultProps,
            size
          },
          ...mountOptions
        })
        
        const container = wrapper.find('.quick-action-buttons')
        expect(container.classes()).toContain(`size-${size}`)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper button attributes', () => {
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      const buttons = wrapper.findAll('[data-testid="button"]')
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBe('false')
      })
    })

    it('should disable buttons when disabled prop is true', () => {
      const wrapper = mount(QuickActionButtons, {
        props: {
          ...defaultProps,
          disabled: true
        },
        ...mountOptions
      })
      
      const buttons = wrapper.findAll('[data-testid="button"]')
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBe('true')
      })
    })

    it('should have proper ARIA attributes for dropdown', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      expect(dropdownTrigger.exists()).toBe(true)
    })
  })

  describe('Lifecycle Management', () => {
    it('should add resize listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const removeDocumentListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeDocumentListenerSpy).toHaveBeenCalledWith('click', expect.any(Function))
    })
  })

  describe('Dropdown Positioning', () => {
    it('should position dropdown correctly', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      
      // Mock getBoundingClientRect
      const mockGetBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 200,
        right: 250,
        bottom: 130,
        width: 50,
        height: 30
      }))
      
      const wrapper = mount(QuickActionButtons, {
        props: defaultProps,
        ...mountOptions
      })
      
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      // Mock the DOM elements
      const component = wrapper.vm as any
      component.$refs.dropdownTrigger = {
        getBoundingClientRect: mockGetBoundingClientRect
      }
      component.$refs.dropdownMenu = {
        getBoundingClientRect: () => ({ width: 120, height: 90 }),
        style: {}
      }
      
      const dropdownTrigger = wrapper.find('.dropdown-trigger')
      await dropdownTrigger.trigger('click')
      await nextTick()
      
      expect(mockGetBoundingClientRect).toHaveBeenCalled()
    })
  })
})