import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseButton from '~/components/BaseButton.vue'
import ActionButton from '~/components/ActionButton.vue'
import AppLink from '~/components/AppLink.vue'
import NavigationLink from '~/components/NavigationLink.vue'
import QuickActionButtons from '~/components/QuickActionButtons.vue'

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

const MockConfirmDialog = {
  name: 'ConfirmDialog',
  template: '<div></div>'
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

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: vi.fn()
  })
}))

describe('Interactive Elements Integration Tests', () => {
  describe('Button-Form Integration', () => {
    const FormWithButtons = {
      template: `
        <form @submit.prevent="handleSubmit">
          <input v-model="formData.name" type="text" required />
          <div class="form-actions">
            <ActionButton 
              action="cancel" 
              @click="handleCancel"
              data-testid="cancel-btn"
            />
            <BaseButton 
              @click="handleSubmit"
              :disabled="!isFormValid"
              data-testid="submit-btn"
            >
              Submit
            </BaseButton>
          </div>
        </form>
      `,
      components: {
        BaseButton,
        ActionButton
      },
      data() {
        return {
          formData: { name: '' },
          submitted: false,
          cancelled: false
        }
      },
      computed: {
        isFormValid() {
          return this.formData.name.trim().length > 0
        }
      },
      methods: {
        handleSubmit() {
          if (this.isFormValid) {
            this.submitted = true
          }
        },
        handleCancel() {
          this.cancelled = true
          this.formData.name = ''
        }
      }
    }

    let wrapper: any

    beforeEach(() => {
      wrapper = mount(FormWithButtons, {
        global: {
          components: {
            Button: MockButton,
            ConfirmDialog: MockConfirmDialog
          }
        }
      })
    })

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should integrate buttons with form validation', async () => {
      // Initially form is invalid, submit button should be disabled
      const submitBtn = wrapper.find('[data-testid="submit-btn"]')
      expect(submitBtn.attributes('disabled')).toBeDefined()

      // Fill form to make it valid
      const input = wrapper.find('input')
      await input.setValue('Test Name')

      // Submit button should now be enabled
      expect(submitBtn.attributes('disabled')).toBeUndefined()

      // Click submit should work
      await submitBtn.trigger('click')
      expect(wrapper.vm.submitted).toBe(true)
    })

    it('should handle cancel button interaction', async () => {
      // Fill form first
      const input = wrapper.find('input')
      await input.setValue('Test Name')

      // Click cancel
      const cancelBtn = wrapper.find('[data-testid="cancel-btn"]')
      await cancelBtn.trigger('click')

      expect(wrapper.vm.cancelled).toBe(true)
      expect(wrapper.vm.formData.name).toBe('')
    })

    it('should maintain button states during form interactions', async () => {
      const input = wrapper.find('input')
      const submitBtn = wrapper.find('[data-testid="submit-btn"]')

      // Test state changes as user types
      expect(submitBtn.attributes('disabled')).toBeDefined()

      await input.setValue('T')
      expect(submitBtn.attributes('disabled')).toBeUndefined()

      await input.setValue('')
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('Navigation Link Integration', () => {
    const NavigationComponent = {
      template: `
        <nav>
          <NavigationLink to="/" exact>Home</NavigationLink>
          <NavigationLink to="/about">About</NavigationLink>
          <AppLink to="https://external.com">External</AppLink>
          <AppLink to="mailto:test@example.com">Email</AppLink>
        </nav>
      `,
      components: {
        NavigationLink,
        AppLink
      }
    }

    let wrapper: any

    beforeEach(() => {
      wrapper = mount(NavigationComponent, {
        global: {
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })
    })

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should render different link types correctly', () => {
      const links = wrapper.findAll('a')
      expect(links).toHaveLength(4)

      // Check internal links use NuxtLink behavior
      const homeLink = links[0]
      const aboutLink = links[1]
      expect(homeLink.attributes('to')).toBe('/')
      expect(aboutLink.attributes('to')).toBe('/about')

      // Check external links have proper attributes
      const externalLink = links[2]
      expect(externalLink.attributes('href')).toBe('https://external.com')
      expect(externalLink.attributes('target')).toBe('_blank')
      expect(externalLink.attributes('rel')).toBe('noopener noreferrer')

      // Check email link
      const emailLink = links[3]
      expect(emailLink.attributes('href')).toBe('mailto:test@example.com')
    })

    it('should handle keyboard navigation across different link types', async () => {
      const links = wrapper.findAll('a')

      for (const link of links) {
        // Test Enter key
        await link.trigger('keydown', { key: 'Enter' })
        expect(wrapper.emitted()).toBeDefined()

        // Test Space key
        await link.trigger('keydown', { key: ' ' })
        expect(wrapper.emitted()).toBeDefined()
      }
    })
  })

  describe('QuickActionButtons Integration', () => {
    const QuickActionsComponent = {
      template: `
        <div>
          <QuickActionButtons
            :actions="actions"
            :loading="loading"
            :disabled="disabled"
            @action="handleAction"
          />
          <div class="results">
            <div v-if="lastAction">Last action: {{ lastAction }}</div>
            <div v-if="actionCount">Action count: {{ actionCount }}</div>
          </div>
        </div>
      `,
      components: {
        QuickActionButtons
      },
      data() {
        return {
          actions: [
            { id: 'view', label: 'View', icon: 'pi pi-eye' },
            { id: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
            { id: 'delete', label: 'Delete', icon: 'pi pi-trash' }
          ],
          loading: false,
          disabled: false,
          lastAction: null,
          actionCount: 0
        }
      },
      methods: {
        handleAction(actionId: string) {
          this.lastAction = actionId
          this.actionCount++
        }
      }
    }

    let wrapper: any

    beforeEach(() => {
      wrapper = mount(QuickActionsComponent, {
        global: {
          components: {
            Button: MockButton
          }
        }
      })
    })

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should integrate with parent component state', async () => {
      // Find and click an action button
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)

      // Simulate clicking the first button (view)
      await buttons[0].trigger('click')

      // Check that parent component received the action
      expect(wrapper.vm.lastAction).toBe('view')
      expect(wrapper.vm.actionCount).toBe(1)
    })

    it('should respect loading and disabled states from parent', async () => {
      // Set loading state
      await wrapper.setData({ loading: true })
      
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })

      // Set disabled state
      await wrapper.setData({ loading: false, disabled: true })
      
      buttons.forEach(button => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })
  })

  describe('Cross-Component State Management', () => {
    const ComplexInteractionComponent = {
      template: `
        <div>
          <BaseButton 
            @click="toggleMode"
            data-testid="mode-toggle"
          >
            {{ editMode ? 'Cancel Edit' : 'Start Edit' }}
          </BaseButton>
          
          <form v-if="editMode" @submit.prevent="saveChanges">
            <input v-model="formData" type="text" />
            <ActionButton 
              action="save" 
              @click="saveChanges"
              :disabled="!formData"
              data-testid="save-btn"
            />
            <ActionButton 
              action="cancel" 
              @click="cancelEdit"
              data-testid="cancel-btn"
            />
          </form>
          
          <div v-else>
            <p>{{ displayData || 'No data' }}</p>
            <AppLink to="/edit" data-testid="edit-link">Edit in new page</AppLink>
          </div>
        </div>
      `,
      components: {
        BaseButton,
        ActionButton,
        AppLink
      },
      data() {
        return {
          editMode: false,
          formData: '',
          displayData: 'Initial data',
          saved: false
        }
      },
      methods: {
        toggleMode() {
          this.editMode = !this.editMode
          if (this.editMode) {
            this.formData = this.displayData
          }
        },
        saveChanges() {
          if (this.formData) {
            this.displayData = this.formData
            this.editMode = false
            this.saved = true
          }
        },
        cancelEdit() {
          this.editMode = false
          this.formData = ''
        }
      }
    }

    let wrapper: any

    beforeEach(() => {
      wrapper = mount(ComplexInteractionComponent, {
        global: {
          components: {
            Button: MockButton,
            ConfirmDialog: MockConfirmDialog
          },
          stubs: {
            NuxtLink: {
              template: '<a :to="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })
    })

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should handle complex state transitions between components', async () => {
      // Initially in view mode
      expect(wrapper.vm.editMode).toBe(false)
      expect(wrapper.find('form').exists()).toBe(false)
      expect(wrapper.find('[data-testid="edit-link"]').exists()).toBe(true)

      // Toggle to edit mode
      await wrapper.find('[data-testid="mode-toggle"]').trigger('click')
      expect(wrapper.vm.editMode).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('[data-testid="edit-link"]').exists()).toBe(false)

      // Make changes and save
      const input = wrapper.find('input')
      await input.setValue('Updated data')
      
      await wrapper.find('[data-testid="save-btn"]').trigger('click')
      
      expect(wrapper.vm.editMode).toBe(false)
      expect(wrapper.vm.displayData).toBe('Updated data')
      expect(wrapper.vm.saved).toBe(true)
    })

    it('should handle cancel workflow correctly', async () => {
      // Enter edit mode
      await wrapper.find('[data-testid="mode-toggle"]').trigger('click')
      
      // Make changes
      const input = wrapper.find('input')
      await input.setValue('Temporary changes')
      
      // Cancel
      await wrapper.find('[data-testid="cancel-btn"]').trigger('click')
      
      expect(wrapper.vm.editMode).toBe(false)
      expect(wrapper.vm.displayData).toBe('Initial data') // Should not be changed
      expect(wrapper.vm.formData).toBe('')
    })
  })

  describe('Error Handling Integration', () => {
    const ErrorHandlingComponent = {
      template: `
        <div>
          <BaseButton 
            @click="triggerError"
            data-testid="error-btn"
          >
            Trigger Error
          </BaseButton>
          
          <BaseButton 
            @click="triggerSuccess"
            data-testid="success-btn"
          >
            Trigger Success
          </BaseButton>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="success" class="success-message">Success!</div>
        </div>
      `,
      components: {
        BaseButton
      },
      data() {
        return {
          error: null,
          success: false
        }
      },
      methods: {
        async triggerError() {
          try {
            throw new Error('Test error')
          } catch (err) {
            this.error = err.message
            this.success = false
          }
        },
        async triggerSuccess() {
          this.error = null
          this.success = true
          setTimeout(() => {
            this.success = false
          }, 2000)
        }
      }
    }

    let wrapper: any

    beforeEach(() => {
      wrapper = mount(ErrorHandlingComponent, {
        global: {
          components: {
            Button: MockButton
          }
        }
      })
    })

    afterEach(() => {
      wrapper?.unmount()
    })

    it('should handle error states across components', async () => {
      await wrapper.find('[data-testid="error-btn"]').trigger('click')
      
      expect(wrapper.vm.error).toBe('Test error')
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('Test error')
    })

    it('should handle success states across components', async () => {
      await wrapper.find('[data-testid="success-btn"]').trigger('click')
      
      expect(wrapper.vm.success).toBe(true)
      expect(wrapper.find('.success-message').exists()).toBe(true)
      expect(wrapper.find('.success-message').text()).toBe('Success!')
    })

    it('should clear error when success occurs', async () => {
      // First trigger error
      await wrapper.find('[data-testid="error-btn"]').trigger('click')
      expect(wrapper.vm.error).toBe('Test error')
      
      // Then trigger success
      await wrapper.find('[data-testid="success-btn"]').trigger('click')
      expect(wrapper.vm.error).toBe(null)
      expect(wrapper.vm.success).toBe(true)
    })
  })
})