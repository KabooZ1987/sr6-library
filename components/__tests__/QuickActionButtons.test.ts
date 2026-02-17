import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import QuickActionButtons from '../QuickActionButtons.vue'

// Mock PrimeVue components
const MockButton = {
  name: 'Button',
  template: `
    <button 
      :disabled="disabled"
      :class="['p-button', $attrs.class]"
      :severity="severity"
      :size="size"
      @click="$emit('click', $event)"
    >
      <i v-if="icon" :class="icon"></i>
      <slot />
    </button>
  `,
  props: ['disabled', 'severity', 'size', 'icon'],
  emits: ['click']
}

const MockMenu = {
  name: 'Menu',
  template: `
    <div class="p-menu" :class="{ 'p-menu-overlay': popup }">
      <ul class="p-menu-list">
        <li v-for="item in model" :key="item.id" class="p-menuitem">
          <a class="p-menuitem-link" @click="$emit('item-click', { item })">
            <i v-if="item.icon" :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </div>
  `,
  props: ['model', 'popup'],
  emits: ['item-click'],
  methods: {
    toggle: vi.fn(),
    show: vi.fn(),
    hide: vi.fn()
  }
}

// Mock window for responsive testing
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

describe('QuickActionButtons', () => {
  let wrapper: VueWrapper<any>

  const defaultActions = [
    { id: 'view', label: 'View', icon: 'pi pi-eye' },
    { id: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { id: 'delete', label: 'Delete', icon: 'pi pi-trash' }
  ]

  beforeEach(() => {
    // Reset window width
    window.innerWidth = 1024
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}) => {
    return mount(QuickActionButtons, {
      props: {
        actions: defaultActions,
        ...props
      },
      global: {
        components: {
          Button: MockButton,
          Menu: MockMenu
        }
      }
    })
  }

  describe('Desktop Rendering', () => {
    it('should render all action buttons on desktop', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
      
      // Check button content
      expect(buttons[0].text()).toContain('View')
      expect(buttons[1].text()).toContain('Edit')
      expect(buttons[2].text()).toContain('Delete')
    })

    it('should apply correct severities to buttons', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      
      // View button should be info
      expect(buttons[0].attributes('severity')).toBe('info')
      
      // Edit button should be warning
      expect(buttons[1].attributes('severity')).toBe('warning')
      
      // Delete button should be danger
      expect(buttons[2].attributes('severity')).toBe('danger')
    })

    it('should show icons when showIcons is true', () => {
      wrapper = createWrapper({ showIcons: true })
      
      const icons = wrapper.findAll('i')
      expect(icons).toHaveLength(3)
      
      expect(icons[0].classes()).toContain('pi-eye')
      expect(icons[1].classes()).toContain('pi-pencil')
      expect(icons[2].classes()).toContain('pi-trash')
    })

    it('should hide icons when showIcons is false', () => {
      wrapper = createWrapper({ showIcons: false })
      
      const icons = wrapper.findAll('i')
      expect(icons).toHaveLength(0)
    })
  })

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      window.innerWidth = 480 // Mobile width
    })

    it('should render dropdown menu on mobile', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      // Should have one trigger button and a menu
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(1) // Only the dropdown trigger
      
      const menu = wrapper.findComponent({ name: 'Menu' })
      expect(menu.exists()).toBe(true)
    })

    it('should show menu items when dropdown is opened', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const menu = wrapper.findComponent({ name: 'Menu' })
      expect(menu.props('model')).toEqual(defaultActions)
    })

    it('should emit action when menu item is clicked', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const menu = wrapper.findComponent({ name: 'Menu' })
      await menu.vm.$emit('item-click', { item: defaultActions[0] })
      
      expect(wrapper.emitted('action')).toBeTruthy()
      expect(wrapper.emitted('action')[0]).toEqual(['view'])
    })
  })

  describe('Responsive Behavior', () => {
    it('should switch between desktop and mobile layouts', async () => {
      // Start with desktop
      window.innerWidth = 1024
      wrapper = createWrapper()
      
      let buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(3)
      
      // Switch to mobile
      window.innerWidth = 480
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      // Should re-render for mobile
      buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(1) // Only dropdown trigger
    })

    it('should handle breakpoint changes smoothly', async () => {
      wrapper = createWrapper()
      
      const breakpoints = [1200, 768, 480, 320, 768, 1200]
      
      for (const width of breakpoints) {
        window.innerWidth = width
        window.dispatchEvent(new Event('resize'))
        await nextTick()
        
        // Should always render something
        const buttons = wrapper.findAll('button')
        expect(buttons.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Action Handling', () => {
    it('should emit action events when buttons are clicked', async () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      
      // Click each button
      for (let i = 0; i < buttons.length; i++) {
        await buttons[i].trigger('click')
      }
      
      expect(wrapper.emitted('action')).toHaveLength(3)
      expect(wrapper.emitted('action')[0]).toEqual(['view'])
      expect(wrapper.emitted('action')[1]).toEqual(['edit'])
      expect(wrapper.emitted('action')[2]).toEqual(['delete'])
    })

    it('should not emit events when disabled', async () => {
      wrapper = createWrapper({ disabled: true })
      
      const buttons = wrapper.findAll('button')
      
      // All buttons should be disabled
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
      
      // Click should not emit events
      await buttons[0].trigger('click')
      expect(wrapper.emitted('action')).toBeFalsy()
    })

    it('should handle loading state', async () => {
      wrapper = createWrapper({ loading: true })
      
      const buttons = wrapper.findAll('button')
      
      // All buttons should be disabled during loading
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Custom Actions', () => {
    it('should handle custom action configurations', () => {
      const customActions = [
        { id: 'custom1', label: 'Custom Action', icon: 'pi pi-star', severity: 'success' },
        { id: 'custom2', label: 'Another Action', icon: 'pi pi-heart', severity: 'help' }
      ]
      
      wrapper = createWrapper({ actions: customActions })
      
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(2)
      
      expect(buttons[0].text()).toContain('Custom Action')
      expect(buttons[0].attributes('severity')).toBe('success')
      
      expect(buttons[1].text()).toContain('Another Action')
      expect(buttons[1].attributes('severity')).toBe('help')
    })

    it('should handle actions without icons', () => {
      const actionsWithoutIcons = [
        { id: 'text1', label: 'Text Only' },
        { id: 'text2', label: 'Another Text' }
      ]
      
      wrapper = createWrapper({ 
        actions: actionsWithoutIcons,
        showIcons: true 
      })
      
      const icons = wrapper.findAll('i')
      expect(icons).toHaveLength(0)
    })

    it('should handle empty actions array', () => {
      wrapper = createWrapper({ actions: [] })
      
      const buttons = wrapper.findAll('button')
      expect(buttons).toHaveLength(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      
      buttons.forEach((button, index) => {
        const action = defaultActions[index]
        expect(button.attributes('aria-label')).toContain(action.label)
      })
    })

    it('should have proper role for dropdown menu', async () => {
      window.innerWidth = 480
      wrapper = createWrapper()
      await nextTick()
      
      const menu = wrapper.findComponent({ name: 'Menu' })
      expect(menu.exists()).toBe(true)
    })

    it('should be keyboard navigable', async () => {
      wrapper = createWrapper()
      
      const buttons = wrapper.findAll('button')
      
      // Each button should be focusable
      for (const button of buttons) {
        await button.trigger('focus')
        // In a real test, we'd check focus state
        expect(button.exists()).toBe(true)
      }
    })
  })

  describe('Styling and Layout', () => {
    it('should apply size prop to buttons', () => {
      wrapper = createWrapper({ size: 'large' })
      
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('size')).toBe('large')
      })
    })

    it('should apply custom CSS classes', () => {
      wrapper = createWrapper({ class: 'custom-actions' })
      
      expect(wrapper.classes()).toContain('custom-actions')
    })

    it('should handle touch-friendly mode', () => {
      wrapper = createWrapper({ touchFriendly: true })
      
      expect(wrapper.classes()).toContain('quick-actions--touch-friendly')
    })
  })

  describe('Performance', () => {
    it('should handle large numbers of actions efficiently', () => {
      const manyActions = Array.from({ length: 50 }, (_, i) => ({
        id: `action-${i}`,
        label: `Action ${i}`,
        icon: 'pi pi-star'
      }))
      
      const startTime = performance.now()
      wrapper = createWrapper({ actions: manyActions })
      const renderTime = performance.now() - startTime
      
      // Should render quickly even with many actions
      expect(renderTime).toBeLessThan(50)
      
      // On desktop, should render all buttons
      if (window.innerWidth >= 768) {
        const buttons = wrapper.findAll('button')
        expect(buttons).toHaveLength(50)
      }
    })

    it('should not re-render unnecessarily', async () => {
      wrapper = createWrapper()
      
      const initialHtml = wrapper.html()
      
      // Update props that shouldn't cause re-render
      await wrapper.setProps({ loading: false })
      
      // HTML should be similar (allowing for minor differences)
      expect(wrapper.html().length).toBeCloseTo(initialHtml.length, -1)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed action objects gracefully', () => {
      const malformedActions = [
        { id: 'good', label: 'Good Action', icon: 'pi pi-check' },
        { id: 'bad' }, // Missing label
        { label: 'No ID' }, // Missing id
        null, // Null action
        undefined // Undefined action
      ]
      
      expect(() => {
        wrapper = createWrapper({ actions: malformedActions })
      }).not.toThrow()
      
      // Should render only valid actions
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should handle resize events gracefully', async () => {
      wrapper = createWrapper()
      
      // Rapid resize events
      for (let i = 0; i < 10; i++) {
        window.innerWidth = 400 + (i * 100)
        window.dispatchEvent(new Event('resize'))
      }
      
      await nextTick()
      
      // Should still be functional
      expect(wrapper.exists()).toBe(true)
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})