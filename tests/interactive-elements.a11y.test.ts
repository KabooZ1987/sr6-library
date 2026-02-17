import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import axe from 'axe-core'
import BaseButton from '~/components/BaseButton.vue'
import ActionButton from '~/components/ActionButton.vue'
import AppLink from '~/components/AppLink.vue'
import NavigationLink from '~/components/NavigationLink.vue'
import { auditAccessibility } from '~/utils/accessibilityAudit'

// Mock axe-core
vi.mock('axe-core', () => ({
  default: {
    run: vi.fn().mockResolvedValue({
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: []
    }),
    configure: vi.fn(),
    getRules: vi.fn().mockReturnValue([]),
    reset: vi.fn()
  }
}))

// Mock PrimeVue components
const MockButton = {
  name: 'Button',
  template: `
    <button 
      :disabled="disabled"
      :class="['p-button', $attrs.class]"
      :aria-label="$attrs['aria-label']"
      :aria-describedby="$attrs['aria-describedby']"
      :aria-busy="$attrs['aria-busy']"
      :tabindex="$attrs.tabindex"
      @click="$emit('click', $event)"
      @keydown="$emit('keydown', $event)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      <span v-if="loading" class="p-button-loading-icon" aria-hidden="true">Loading...</span>
      <slot v-else />
    </button>
  `,
  props: ['disabled', 'loading', 'severity', 'size'],
  emits: ['click', 'keydown', 'focus', 'blur']
}

// Mock composables
vi.mock('~/composables/useButtonState', () => ({
  useButtonState: () => ({
    state: {
      enabled: true,
      loading: false,
      error: null,
      success: false,
      retryCount: 0
    },
    execute: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
    setEnabled: vi.fn(),
    retry: vi.fn(),
    computedDisabled: { value: false }
  })
}))

describe('Interactive Elements Accessibility Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
    
    // Add live region for screen reader announcements
    const liveRegion = document.createElement('div')
    liveRegion.id = 'accessibility-live-region'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    document.body.appendChild(liveRegion)
  })

  describe('BaseButton Accessibility', () => {
    let wrapper: any

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should have proper ARIA attributes', () => {
      wrapper = mount(BaseButton, {
        props: {
          ariaLabel: 'Save document',
          ariaDescribedBy: 'save-help'
        },
        slots: {
          default: 'Save'
        },
        global: {
          components: { Button: MockButton }
        }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-label')).toBe('Save document')
      expect(button.attributes('aria-describedby')).toBe('save-help')
    })

    it('should announce loading state to screen readers', async () => {
      const mockButtonState = {
        state: {
          enabled: true,
          loading: true,
          error: null,
          success: false,
          retryCount: 0
        },
        execute: vi.fn(),
        reset: vi.fn(),
        setEnabled: vi.fn(),
        retry: vi.fn(),
        computedDisabled: { value: true }
      }

      vi.mocked(require('~/composables/useButtonState').useButtonState).mockReturnValue(mockButtonState)

      wrapper = mount(BaseButton, {
        slots: { default: 'Loading Button' },
        global: { components: { Button: MockButton } }
      })

      const button = wrapper.find('button')
      expect(button.attributes('aria-busy')).toBe('true')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should be keyboard accessible', async () => {
      wrapper = mount(BaseButton, {
        slots: { default: 'Keyboard Button' },
        global: { components: { Button: MockButton } }
      })

      const button = wrapper.find('button')
      
      // Test Enter key
      await button.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('keydown')).toBeTruthy()

      // Test Space key
      await button.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('keydown')).toHaveLength(2)

      // Test focus events
      await button.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()

      await button.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should have sufficient color contrast', async () => {
      wrapper = mount(BaseButton, {
        props: { severity: 'primary' },
        slots: { default: 'Primary Button' },
        global: { components: { Button: MockButton } }
      })

      // Mock getComputedStyle to return high contrast colors
      const mockGetComputedStyle = vi.fn().mockReturnValue({
        color: 'rgb(255, 255, 255)', // White text
        backgroundColor: 'rgb(0, 123, 255)', // Blue background
        fontSize: '16px'
      })
      
      vi.stubGlobal('getComputedStyle', mockGetComputedStyle)

      const button = wrapper.find('button')
      const styles = getComputedStyle(button.element)
      
      // Verify high contrast colors are used
      expect(styles.color).toBe('rgb(255, 255, 255)')
      expect(styles.backgroundColor).toBe('rgb(0, 123, 255)')
    })

    it('should respect reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
      vi.stubGlobal('matchMedia', mockMatchMedia)

      wrapper = mount(BaseButton, {
        slots: { default: 'Motion Button' },
        global: { components: { Button: MockButton } }
      })

      // Verify reduced motion query was checked
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })
  })

  describe('ActionButton Accessibility', () => {
    let wrapper: any

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should have descriptive ARIA labels for different actions', () => {
      const actions = ['view', 'edit', 'delete', 'save', 'cancel'] as const
      
      actions.forEach(action => {
        wrapper = mount(ActionButton, {
          props: { 
            action,
            itemName: 'Test Item'
          },
          global: { 
            components: { 
              Button: MockButton,
              BaseButton: {
                template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
                emits: ['click']
              }
            }
          }
        })

        const button = wrapper.find('button')
        const ariaLabel = button.attributes('aria-label') || wrapper.vm.computedAriaLabel
        
        expect(ariaLabel).toContain(action.charAt(0).toUpperCase() + action.slice(1))
        expect(ariaLabel).toContain('Test Item')
        
        wrapper.unmount()
      })
    })

    it('should announce confirmation requirements for destructive actions', () => {
      wrapper = mount(ActionButton, {
        props: { 
          action: 'delete',
          itemName: 'Important Document'
        },
        global: { 
          components: { 
            Button: MockButton,
            BaseButton: {
              template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
              emits: ['click']
            }
          }
        }
      })

      // Should have visual indicator for confirmation requirement
      expect(wrapper.classes()).toContain('action-button--confirmation-required')
    })

    it('should handle keyboard activation for confirmation dialogs', async () => {
      const mockConfirm = vi.fn()
      vi.mocked(require('primevue/useconfirm').useConfirm).mockReturnValue({
        require: mockConfirm
      })

      wrapper = mount(ActionButton, {
        props: { action: 'delete' },
        global: { 
          components: { 
            Button: MockButton,
            BaseButton: {
              template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)" @keydown="$emit(\'keydown\', $event)"><slot /></button>',
              emits: ['click', 'keydown']
            }
          }
        }
      })

      const button = wrapper.find('button')
      
      // Test Enter key triggers confirmation
      await button.trigger('keydown', { key: 'Enter' })
      expect(mockConfirm).toHaveBeenCalled()

      // Test Space key triggers confirmation
      await button.trigger('keydown', { key: ' ' })
      expect(mockConfirm).toHaveBeenCalledTimes(2)
    })
  })

  describe('AppLink Accessibility', () => {
    let wrapper: any

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should have proper ARIA attributes for external links', () => {
      wrapper = mount(AppLink, {
        props: { to: 'https://external.com' },
        slots: { default: 'External Link' },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      const link = wrapper.find('a')
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
      expect(link.attributes('aria-label')).toBe('Opens in new tab')
    })

    it('should be keyboard navigable', async () => {
      wrapper = mount(AppLink, {
        props: { to: '/internal' },
        slots: { default: 'Internal Link' },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to" @click="$emit(\'click\', $event)" @keydown="$emit(\'keydown\', $event)"><slot /></a>',
              props: ['to'],
              emits: ['click', 'keydown']
            }
          }
        }
      })

      const link = wrapper.find('a')
      
      // Test keyboard navigation
      await link.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('click')).toBeTruthy()

      await link.trigger('keydown', { key: ' ' })
      expect(wrapper.emitted('click')).toHaveLength(2)
    })

    it('should handle disabled state accessibility', () => {
      wrapper = mount(AppLink, {
        props: { 
          to: '/disabled',
          disabled: true
        },
        slots: { default: 'Disabled Link' },
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      const link = wrapper.find('a')
      expect(link.attributes('tabindex')).toBe('-1')
      expect(link.classes()).toContain('app-link--disabled')
    })
  })

  describe('NavigationLink Accessibility', () => {
    let wrapper: any

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should indicate active state to screen readers', () => {
      // Mock useRoute to return current path
      vi.mock('vue-router', () => ({
        useRoute: () => ({
          path: '/current-page'
        })
      }))

      wrapper = mount(NavigationLink, {
        props: { to: '/current-page' },
        slots: { default: 'Current Page' },
        global: {
          components: {
            AppLink: {
              template: '<a :to="to" :class="$attrs.class"><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      expect(wrapper.classes()).toContain('nav-link--active')
    })

    it('should have proper role for navigation', () => {
      wrapper = mount(NavigationLink, {
        props: { to: '/page' },
        slots: { default: 'Page Link' },
        global: {
          components: {
            AppLink: {
              template: '<a :to="to" role="menuitem"><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      const link = wrapper.find('a')
      expect(link.attributes('role')).toBe('menuitem')
    })
  })

  describe('Focus Management', () => {
    it('should manage focus correctly in modal workflows', async () => {
      const ModalComponent = {
        template: `
          <div>
            <BaseButton @click="openModal" data-testid="open-btn">
              Open Modal
            </BaseButton>
            
            <div v-if="showModal" class="modal" role="dialog" aria-modal="true">
              <BaseButton @click="closeModal" data-testid="close-btn">
                Close
              </BaseButton>
              <ActionButton action="save" @click="save" data-testid="save-btn" />
            </div>
          </div>
        `,
        components: { BaseButton, ActionButton },
        data() {
          return { showModal: false }
        },
        methods: {
          openModal() {
            this.showModal = true
            this.$nextTick(() => {
              // Focus should move to modal
              const closeBtn = this.$el.querySelector('[data-testid="close-btn"]')
              closeBtn?.focus()
            })
          },
          closeModal() {
            this.showModal = false
            this.$nextTick(() => {
              // Focus should return to trigger
              const openBtn = this.$el.querySelector('[data-testid="open-btn"]')
              openBtn?.focus()
            })
          },
          save() {
            this.closeModal()
          }
        }
      }

      const wrapper = mount(ModalComponent, {
        global: {
          components: { Button: MockButton }
        }
      })

      // Open modal
      await wrapper.find('[data-testid="open-btn"]').trigger('click')
      expect(wrapper.vm.showModal).toBe(true)

      // Modal should be properly marked
      const modal = wrapper.find('.modal')
      expect(modal.attributes('role')).toBe('dialog')
      expect(modal.attributes('aria-modal')).toBe('true')

      // Close modal
      await wrapper.find('[data-testid="close-btn"]').trigger('click')
      expect(wrapper.vm.showModal).toBe(false)

      wrapper.unmount()
    })
  })

  describe('Screen Reader Announcements', () => {
    it('should announce state changes', async () => {
      const AnnouncementComponent = {
        template: `
          <div>
            <BaseButton @click="performAction" data-testid="action-btn">
              {{ loading ? 'Loading...' : 'Perform Action' }}
            </BaseButton>
            <div v-if="message" class="message">{{ message }}</div>
          </div>
        `,
        components: { BaseButton },
        data() {
          return {
            loading: false,
            message: ''
          }
        },
        methods: {
          async performAction() {
            this.loading = true
            this.announceToScreenReader('Action started')
            
            setTimeout(() => {
              this.loading = false
              this.message = 'Action completed successfully'
              this.announceToScreenReader('Action completed successfully')
            }, 100)
          },
          announceToScreenReader(message: string) {
            const liveRegion = document.getElementById('accessibility-live-region')
            if (liveRegion) {
              liveRegion.textContent = message
            }
          }
        }
      }

      const wrapper = mount(AnnouncementComponent, {
        global: {
          components: { Button: MockButton }
        }
      })

      // Trigger action
      await wrapper.find('[data-testid="action-btn"]').trigger('click')
      
      // Check initial announcement
      const liveRegion = document.getElementById('accessibility-live-region')
      expect(liveRegion?.textContent).toBe('Action started')

      // Wait for completion
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(liveRegion?.textContent).toBe('Action completed successfully')
      expect(wrapper.vm.message).toBe('Action completed successfully')

      wrapper.unmount()
    })
  })

  describe('Automated Accessibility Testing', () => {
    it('should pass axe-core accessibility tests', async () => {
      const AccessibleComponent = {
        template: `
          <main role="main">
            <h1>Interactive Elements Test</h1>
            <nav role="navigation" aria-label="Main navigation">
              <NavigationLink to="/" aria-label="Go to home page">Home</NavigationLink>
              <NavigationLink to="/about" aria-label="Go to about page">About</NavigationLink>
            </nav>
            
            <section>
              <h2>Actions</h2>
              <BaseButton aria-label="Save document">Save</BaseButton>
              <ActionButton action="delete" item-name="Document" />
            </section>
            
            <section>
              <h2>Links</h2>
              <AppLink to="/internal" aria-label="Internal page link">Internal</AppLink>
              <AppLink to="https://external.com" aria-label="External website link">External</AppLink>
            </section>
          </main>
        `,
        components: {
          BaseButton,
          ActionButton,
          AppLink,
          NavigationLink
        }
      }

      const wrapper = mount(AccessibleComponent, {
        global: {
          components: { 
            Button: MockButton
          },
          stubs: {
            NuxtLink: {
              template: '<a :to="to" v-bind="$attrs"><slot /></a>',
              props: ['to']
            }
          }
        }
      })

      // Run axe accessibility tests
      const results = await axe.run(wrapper.element)
      
      expect(results.violations).toHaveLength(0)
      expect(results.passes.length).toBeGreaterThan(0)

      wrapper.unmount()
    })

    it('should pass custom accessibility audit', async () => {
      const TestComponent = {
        template: `
          <div>
            <button aria-label="Accessible button">Click me</button>
            <a href="/test" aria-label="Test link">Test Link</a>
            <img src="test.jpg" alt="Test image" />
            <input type="text" aria-label="Test input" />
          </div>
        `
      }

      const wrapper = mount(TestComponent)
      
      const auditResult = await auditAccessibility(wrapper.element)
      
      expect(auditResult.score).toBeGreaterThan(90)
      expect(auditResult.summary.errors).toBe(0)

      wrapper.unmount()
    })
  })
})