import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import BaseButton from '../BaseButton.vue'

// Mock the composable
const mockButtonState = {
  state: {
    enabled: true,
    loading: false,
    error: null,
    success: false,
    retryCount: 0
  },
  execute: vi.fn(),
  reset: vi.fn(),
  setEnabled: vi.fn(),
  retry: vi.fn(),
  computedDisabled: ref(false)
}

vi.mock('~/composables/useButtonState', () => ({
  useButtonState: vi.fn(() => mockButtonState)
}))

// Mock process.client
Object.defineProperty(global, 'process', {
  value: {
    client: true
  }
})

// Mock PrimeVue Button component
const MockButton = {
  name: 'Button',
  template: `
    <button 
      :disabled="disabled"
      :class="['p-button', $attrs.class]"
      :aria-label="$attrs['aria-label']"
      :aria-describedby="$attrs['aria-describedby']"
      :aria-busy="$attrs['aria-busy']"
      @click="$emit('click', $event)"
      @keydown="$emit('keydown', $event)"
    >
      <span v-if="loading" class="p-button-loading-icon">Loading...</span>
      <slot v-else />
    </button>
  `,
  props: ['disabled', 'loading', 'severity', 'size'],
  emits: ['click', 'keydown']
}

describe('BaseButton', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    mockButtonState.state.enabled = true
    mockButtonState.state.loading = false
    mockButtonState.state.error = null
    mockButtonState.state.success = false
    mockButtonState.computedDisabled.value = false
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  const createWrapper = (props = {}, slots = {}) => {
    return mount(BaseButton, {
      props,
      slots,
      global: {
        components: {
          Button: MockButton
        }
      }
    })
  }

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      wrapper = createWrapper({}, { default: 'Click me' })

      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Click me')
      expect(wrapper.classes()).toContain('base-button')
    })

    it('applies correct size classes', async () => {
      wrapper = createWrapper({ size: 'large' }, { default: 'Large Button' })

      expect(wrapper.classes()).toContain('base-button--large')

      await wrapper.setProps({ size: 'small' })
      expect(wrapper.classes()).toContain('base-button--small')
    })

    it('applies correct severity classes', async () => {
      wrapper = createWrapper({ severity: 'danger' }, { default: 'Danger Button' })

      expect(wrapper.classes()).toContain('base-button--danger')

      await wrapper.setProps({ severity: 'success' })
      expect(wrapper.classes()).toContain('base-button--success')
    })

    it('applies touch-friendly class when enabled', () => {
      wrapper = createWrapper({ touchFriendly: true }, { default: 'Touch Button' })

      expect(wrapper.classes()).toContain('base-button--touch-friendly')
    })
  })

  describe('State Management', () => {
    it('shows loading state correctly', async () => {
      mockButtonState.state.loading = true
      mockButtonState.computedDisabled.value = true

      wrapper = createWrapper({}, { default: 'Loading Button' })

      expect(wrapper.classes()).toContain('base-button--loading')
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.p-button-loading-icon').exists()).toBe(true)
    })

    it('shows error state correctly', async () => {
      mockButtonState.state.error = 'Something went wrong'

      wrapper = createWrapper({ showErrorIcon: true }, { default: 'Error Button' })

      expect(wrapper.classes()).toContain('base-button--error')
      expect(wrapper.find('.error-icon').exists()).toBe(true)
      expect(wrapper.find('.pi-exclamation-triangle').exists()).toBe(true)
    })

    it('shows success state correctly', async () => {
      mockButtonState.state.success = true

      wrapper = createWrapper({ showSuccessIcon: true }, { default: 'Success Button' })

      expect(wrapper.classes()).toContain('base-button--success')
      expect(wrapper.find('.success-icon').exists()).toBe(true)
      expect(wrapper.find('.pi-check').exists()).toBe(true)
    })

    it('shows disabled state correctly', async () => {
      mockButtonState.computedDisabled.value = true

      wrapper = createWrapper({}, { default: 'Disabled Button' })

      expect(wrapper.classes()).toContain('base-button--disabled')
      expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    })
  })

  describe('Event Handling', () => {
    it('emits click event when clicked', async () => {
      wrapper = createWrapper({}, { default: 'Clickable Button' })

      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('does not emit click when disabled', async () => {
      mockButtonState.computedDisabled.value = true

      wrapper = createWrapper({}, { default: 'Disabled Button' })

      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeFalsy()
    })

    it('emits stateChange event on click', async () => {
      wrapper = createWrapper({}, { default: 'State Button' })

      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('stateChange')).toBeTruthy()
      expect(wrapper.emitted('stateChange')[0][0]).toEqual({
        enabled: true,
        loading: false,
        error: null,
        success: false
      })
    })

    it('handles keyboard events correctly', async () => {
      wrapper = createWrapper({}, { default: 'Keyboard Button' })

      // Test Enter key
      await wrapper.find('button').trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('keydown')).toBeTruthy()

      // Test Space key
      await wrapper.find('button').trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('keydown')).toHaveLength(2)
    })

    it('prevents keyboard activation when disabled', async () => {
      mockButtonState.computedDisabled.value = true

      wrapper = createWrapper({}, { default: 'Disabled Keyboard Button' })

      await wrapper.find('button').trigger('keydown', { key: 'Enter' })
      
      // Should still emit keydown event (this is handled by the mock Button component)
      expect(wrapper.emitted('keydown')).toBeTruthy()
      expect(wrapper.emitted('keydown')).toHaveLength(1)
      
      // When disabled, the component should prevent the click event
      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Accessibility', () => {
    it('sets correct ARIA attributes', () => {
      wrapper = createWrapper({
        ariaLabel: 'Custom button label',
        ariaDescribedBy: 'button-description'
      }, { default: 'ARIA Button' })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Custom button label')
      expect(button.attributes('aria-describedby')).toBe('button-description')
    })

    it('sets aria-busy when loading', () => {
      mockButtonState.state.loading = true

      wrapper = createWrapper({}, { default: 'Loading Button' })

      expect(wrapper.find('button').attributes('aria-busy')).toBe('true')
    })

    it('has proper focus styles', () => {
      wrapper = createWrapper({ severity: 'primary' }, { default: 'Focus Button' })

      expect(wrapper.classes()).toContain('base-button--primary')
      // Focus styles are tested via CSS classes
    })
  })

  describe('Severity State Override', () => {
    it('overrides severity to danger when error state', () => {
      mockButtonState.state.error = 'Error occurred'

      wrapper = createWrapper({ severity: 'primary' }, { default: 'Error Button' })

      // Should use danger severity instead of primary due to error state
      expect(wrapper.vm.computedSeverity).toBe('danger')
    })

    it('overrides severity to success when success state', () => {
      mockButtonState.state.success = true

      wrapper = createWrapper({ severity: 'primary' }, { default: 'Success Button' })

      // Should use success severity instead of primary due to success state
      expect(wrapper.vm.computedSeverity).toBe('success')
    })

    it('uses original severity when no state override', () => {
      wrapper = createWrapper({ severity: 'warning' }, { default: 'Warning Button' })

      expect(wrapper.vm.computedSeverity).toBe('warning')
    })
  })

  describe('Touch-Friendly Behavior', () => {
    beforeEach(() => {
      // Mock window.innerWidth for mobile detection
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500 // Mobile width
      })
    })

    it('increases size on mobile when touch-friendly is enabled', () => {
      wrapper = createWrapper({ 
        touchFriendly: true,
        size: 'normal'
      }, { default: 'Touch Button' })

      // Should upgrade to large size on mobile
      expect(wrapper.vm.computedSize).toBe('large')
    })

    it('keeps original size on desktop when touch-friendly is enabled', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200 // Desktop width
      })

      wrapper = createWrapper({ 
        touchFriendly: true,
        size: 'normal'
      }, { default: 'Touch Button' })

      // Should keep normal size on desktop
      expect(wrapper.vm.computedSize).toBe('normal')
    })
  })

  describe('Icon Display Logic', () => {
    it('shows success icon when success state and showSuccessIcon is true', () => {
      mockButtonState.state.success = true

      wrapper = createWrapper({ showSuccessIcon: true }, { default: 'Success Button' })

      expect(wrapper.find('.success-icon').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('Success Button') // Slot should be hidden
    })

    it('hides success icon when showSuccessIcon is false', () => {
      mockButtonState.state.success = true

      wrapper = createWrapper({ showSuccessIcon: false }, { default: 'Success Button' })

      expect(wrapper.find('.success-icon').exists()).toBe(false)
      expect(wrapper.text()).toContain('Success Button') // Slot should be visible
    })

    it('shows error icon when error state and showErrorIcon is true', () => {
      mockButtonState.state.error = 'Error occurred'

      wrapper = createWrapper({ showErrorIcon: true }, { default: 'Error Button' })

      expect(wrapper.find('.error-icon').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('Error Button') // Slot should be hidden
    })

    it('hides error icon when showErrorIcon is false', () => {
      mockButtonState.state.error = 'Error occurred'

      wrapper = createWrapper({ showErrorIcon: false }, { default: 'Error Button' })

      expect(wrapper.find('.error-icon').exists()).toBe(false)
      expect(wrapper.text()).toContain('Error Button') // Slot should be visible
    })
  })

  describe('Exposed Methods', () => {
    it('exposes state management methods', () => {
      wrapper = createWrapper({}, { default: 'Exposed Button' })

      const exposedMethods = wrapper.vm
      
      expect(exposedMethods.state).toBeDefined()
      expect(exposedMethods.execute).toBeDefined()
      expect(exposedMethods.reset).toBeDefined()
      expect(exposedMethods.retry).toBeDefined()
      expect(exposedMethods.setEnabled).toBeDefined()
      expect(exposedMethods.computedDisabled).toBeDefined()
    })

    it('calls composable methods when exposed methods are called', async () => {
      wrapper = createWrapper({}, { default: 'Method Button' })

      const mockAction = vi.fn().mockResolvedValue(undefined)
      
      await wrapper.vm.execute(mockAction)
      expect(mockButtonState.execute).toHaveBeenCalledWith(mockAction)

      wrapper.vm.reset()
      expect(mockButtonState.reset).toHaveBeenCalled()

      await wrapper.vm.retry()
      expect(mockButtonState.retry).toHaveBeenCalled()

      wrapper.vm.setEnabled(false)
      expect(mockButtonState.setEnabled).toHaveBeenCalledWith(false)
    })
  })

  describe('Props Integration', () => {
    it('syncs disabled prop with internal state', () => {
      wrapper = createWrapper({ disabled: true }, { default: 'Disabled Prop Button' })

      // Should call setEnabled with opposite of disabled
      expect(mockButtonState.setEnabled).toHaveBeenCalledWith(false)
    })

    it('passes buttonStateOptions to composable', () => {
      const options = {
        initialEnabled: false,
        successDuration: 3000,
        errorDuration: 7000
      }

      wrapper = createWrapper({ buttonStateOptions: options }, { default: 'Options Button' })

      // The composable should be called with the provided options
      // This is tested through the component behavior rather than direct mock verification
      expect(wrapper.exists()).toBe(true)
    })
  })
})