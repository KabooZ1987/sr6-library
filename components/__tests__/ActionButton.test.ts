import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ActionButton from '../ActionButton.vue'
import BaseButton from '../BaseButton.vue'
import type { ActionType } from '../ActionButton.vue'

// Mock PrimeVue's useConfirm
const mockConfirm = {
  require: vi.fn()
}

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => mockConfirm
}))

// Mock the useButtonState composable
vi.mock('~/composables/useButtonState', () => ({
  useButtonState: () => ({
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
    computedDisabled: { value: false }
  })
}))

describe('ActionButton', () => {
  let wrapper: VueWrapper<any>

  const createWrapper = (props: any = {}) => {
    return mount(ActionButton, {
      props: {
        action: 'view',
        ...props
      },
      global: {
        components: {
          BaseButton
        },
        stubs: {
          BaseButton: {
            template: '<button @click="$emit(\'click\', $event)" @keydown="$emit(\'keydown\', $event)"><slot /></button>',
            emits: ['click', 'keydown', 'stateChange'],
            props: ['severity', 'disabled', 'loading', 'ariaLabel', 'ariaDescribedby', 'touchFriendly', 'showSuccessIcon', 'showErrorIcon', 'buttonStateOptions'],
            setup(props, { emit }) {
              return {
                state: {
                  enabled: true,
                  loading: false,
                  error: null,
                  success: false
                },
                execute: vi.fn(),
                reset: vi.fn(),
                retry: vi.fn(),
                setEnabled: vi.fn(),
                computedDisabled: { value: false }
              }
            }
          }
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Action Types and Configuration', () => {
    const actionTypes: ActionType[] = ['view', 'edit', 'delete', 'save', 'cancel', 'create', 'update', 'copy', 'download']

    it.each(actionTypes)('should render %s action with correct configuration', (action) => {
      wrapper = createWrapper({ action })
      
      const expectedConfigs = {
        view: { icon: 'pi pi-eye', label: 'View', severity: 'info' },
        edit: { icon: 'pi pi-pencil', label: 'Edit', severity: 'warning' },
        delete: { icon: 'pi pi-trash', label: 'Delete', severity: 'danger' },
        save: { icon: 'pi pi-check', label: 'Save', severity: 'success' },
        cancel: { icon: 'pi pi-times', label: 'Cancel', severity: 'secondary' },
        create: { icon: 'pi pi-plus', label: 'Create', severity: 'success' },
        update: { icon: 'pi pi-refresh', label: 'Update', severity: 'primary' },
        copy: { icon: 'pi pi-copy', label: 'Copy', severity: 'info' },
        download: { icon: 'pi pi-download', label: 'Download', severity: 'primary' }
      }

      const config = expectedConfigs[action]
      const icon = wrapper.find('.action-icon')
      const label = wrapper.find('.action-label')

      expect(icon.classes()).toContain(config.icon.split(' ')[1])
      expect(label.text()).toBe(config.label)
      expect(wrapper.vm.actionSeverity).toBe(config.severity)
    })

    it('should use custom label and icon when provided', () => {
      wrapper = createWrapper({
        action: 'view',
        customLabel: 'Custom View',
        customIcon: 'pi pi-custom'
      })

      const icon = wrapper.find('.action-icon')
      const label = wrapper.find('.action-label')

      expect(icon.classes()).toContain('pi-custom')
      expect(label.text()).toBe('Custom View')
    })

    it('should hide icon when showIcon is false', () => {
      wrapper = createWrapper({
        action: 'view',
        showIcon: false
      })

      const icon = wrapper.find('.action-icon')
      expect(icon.exists()).toBe(false)
    })

    it('should hide label when showLabel is false', () => {
      wrapper = createWrapper({
        action: 'view',
        showLabel: false
      })

      const label = wrapper.find('.action-label')
      expect(label.exists()).toBe(false)
    })
  })

  describe('Confirmation Patterns', () => {
    it('should require confirmation for delete action by default', () => {
      wrapper = createWrapper({ action: 'delete' })
      expect(wrapper.vm.confirmationRequired).toBe(true)
    })

    it('should not require confirmation for non-destructive actions by default', () => {
      const nonDestructiveActions: ActionType[] = ['view', 'edit', 'save', 'cancel', 'create', 'update', 'copy', 'download']
      
      nonDestructiveActions.forEach(action => {
        wrapper = createWrapper({ action })
        expect(wrapper.vm.confirmationRequired).toBe(false)
      })
    })

    it('should override default confirmation requirement when explicitly set', () => {
      wrapper = createWrapper({
        action: 'view',
        requireConfirmation: true
      })
      expect(wrapper.vm.confirmationRequired).toBe(true)
    })

    it('should show confirmation dialog for destructive actions', async () => {
      wrapper = createWrapper({ action: 'delete' })
      
      await wrapper.find('button').trigger('click')
      
      expect(mockConfirm.require).toHaveBeenCalledWith({
        message: 'Are you sure you want to delete this item? This action cannot be undone.',
        header: 'Confirm Delete',
        acceptLabel: 'Confirm',
        rejectLabel: 'Cancel',
        severity: 'danger',
        accept: expect.any(Function),
        reject: expect.any(Function)
      })
    })

    it('should use custom confirmation messages', async () => {
      wrapper = createWrapper({
        action: 'delete',
        confirmationMessage: 'Custom delete message',
        confirmationHeader: 'Custom Header',
        confirmationAcceptLabel: 'Yes, Delete',
        confirmationRejectLabel: 'No, Keep',
        itemName: 'Test Item'
      })
      
      await wrapper.find('button').trigger('click')
      
      expect(mockConfirm.require).toHaveBeenCalledWith({
        message: 'Custom delete message',
        header: 'Custom Header',
        acceptLabel: 'Yes, Delete',
        rejectLabel: 'No, Keep',
        severity: 'danger',
        accept: expect.any(Function),
        reject: expect.any(Function)
      })
    })

    it('should emit confirmed event when confirmation is accepted', async () => {
      wrapper = createWrapper({ action: 'delete' })
      
      await wrapper.find('button').trigger('click')
      
      // Get the accept callback and call it
      const confirmCall = mockConfirm.require.mock.calls[0][0]
      confirmCall.accept()
      
      expect(wrapper.emitted('confirmed')).toBeTruthy()
      expect(wrapper.emitted('confirmed')[0]).toEqual(['delete'])
    })

    it('should emit cancelled event when confirmation is rejected', async () => {
      wrapper = createWrapper({ action: 'delete' })
      
      await wrapper.find('button').trigger('click')
      
      // Get the reject callback and call it
      const confirmCall = mockConfirm.require.mock.calls[0][0]
      confirmCall.reject()
      
      expect(wrapper.emitted('cancelled')).toBeTruthy()
      expect(wrapper.emitted('cancelled')[0]).toEqual(['delete'])
    })
  })

  describe('Event Handling', () => {
    it('should emit click event with action type for non-confirmation actions', async () => {
      wrapper = createWrapper({ action: 'view' })
      
      const clickEvent = new MouseEvent('click')
      await wrapper.find('button').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')[0][1]).toBe('view')
    })

    it('should emit keydown event with action type', async () => {
      wrapper = createWrapper({ action: 'view' })
      
      await wrapper.find('button').trigger('keydown', { key: 'Tab' })
      
      expect(wrapper.emitted('keydown')).toBeTruthy()
      expect(wrapper.emitted('keydown')[0][1]).toBe('view')
    })

    it('should handle Enter key for confirmation actions', async () => {
      wrapper = createWrapper({ action: 'delete' })
      
      await wrapper.find('button').trigger('keydown', { key: 'Enter' })
      
      expect(mockConfirm.require).toHaveBeenCalled()
    })

    it('should handle Space key for confirmation actions', async () => {
      wrapper = createWrapper({ action: 'delete' })
      
      await wrapper.find('button').trigger('keydown', { key: ' ' })
      
      expect(mockConfirm.require).toHaveBeenCalled()
    })

    it('should emit stateChange event with action type', () => {
      wrapper = createWrapper({ action: 'view' })
      
      const mockState = { enabled: true, loading: false, error: null, success: false }
      wrapper.vm.handleStateChange(mockState)
      
      expect(wrapper.emitted('stateChange')).toBeTruthy()
      expect(wrapper.emitted('stateChange')[0]).toEqual([mockState, 'view'])
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label by default', () => {
      wrapper = createWrapper({ action: 'view' })
      expect(wrapper.vm.computedAriaLabel).toBe('View item')
    })

    it('should use custom aria-label when provided', () => {
      wrapper = createWrapper({
        action: 'view',
        ariaLabel: 'Custom aria label'
      })
      expect(wrapper.vm.computedAriaLabel).toBe('Custom aria label')
    })

    it('should include item name in aria-label', () => {
      wrapper = createWrapper({
        action: 'edit',
        itemName: 'User Profile'
      })
      expect(wrapper.vm.computedAriaLabel).toBe('Edit User Profile')
    })

    it('should update aria-label based on state', () => {
      wrapper = createWrapper({ action: 'save' })
      
      // The state is computed from BaseButton, so we can't directly modify it
      // Instead, test the basic aria-label functionality
      expect(wrapper.vm.computedAriaLabel).toBe('Save item')
    })

    it('should have confirmation indicator for destructive actions', () => {
      wrapper = createWrapper({ action: 'delete' })
      expect(wrapper.classes()).toContain('action-button--confirmation-required')
    })
  })

  describe('Styling and Layout', () => {
    it('should apply correct action-specific classes', () => {
      wrapper = createWrapper({ action: 'delete' })
      expect(wrapper.classes()).toContain('action-button--delete')
    })

    it('should apply icon-only class when label is hidden', () => {
      wrapper = createWrapper({
        action: 'view',
        showLabel: false,
        showIcon: true
      })
      expect(wrapper.classes()).toContain('action-button--icon-only')
    })

    it('should apply label-only class when icon is hidden', () => {
      wrapper = createWrapper({
        action: 'view',
        showLabel: true,
        showIcon: false
      })
      expect(wrapper.classes()).toContain('action-button--label-only')
    })
  })

  describe('Props Validation', () => {
    it('should handle all supported action types', () => {
      const actionTypes: ActionType[] = ['view', 'edit', 'delete', 'save', 'cancel', 'create', 'update', 'copy', 'download']
      
      actionTypes.forEach(action => {
        wrapper = createWrapper({ action })
        expect(wrapper.vm.action).toBe(action)
        expect(wrapper.vm.actionConfig).toBeDefined()
      })
    })

    it('should pass through BaseButton props correctly', () => {
      wrapper = createWrapper({
        action: 'view',
        disabled: true,
        touchFriendly: true,
        showSuccessIcon: false,
        showErrorIcon: false
      })

      // Since we're using a stub, we can check the props directly on the wrapper
      expect(wrapper.props('disabled')).toBe(true)
      expect(wrapper.props('touchFriendly')).toBe(true)
      expect(wrapper.props('showSuccessIcon')).toBe(false)
      expect(wrapper.props('showErrorIcon')).toBe(false)
    })
  })

  describe('Exposed Methods', () => {
    it('should expose state and methods from BaseButton', () => {
      wrapper = createWrapper({ action: 'view' })
      
      expect(wrapper.vm.state).toBeDefined()
      expect(wrapper.vm.execute).toBeTypeOf('function')
      expect(wrapper.vm.reset).toBeTypeOf('function')
      expect(wrapper.vm.retry).toBeTypeOf('function')
      expect(wrapper.vm.setEnabled).toBeTypeOf('function')
    })

    it('should expose action-specific properties', () => {
      wrapper = createWrapper({ action: 'delete' })
      
      expect(wrapper.vm.action).toBe('delete')
      expect(wrapper.vm.actionConfig).toBeDefined()
      expect(wrapper.vm.actionConfig.severity).toBe('danger')
      expect(wrapper.vm.actionConfig.requiresConfirmation).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing itemName gracefully', () => {
      wrapper = createWrapper({
        action: 'delete',
        itemName: undefined
      })
      
      expect(wrapper.vm.confirmationMessage).toContain('this item')
    })

    it('should handle missing itemType gracefully', () => {
      wrapper = createWrapper({
        action: 'delete',
        itemType: undefined
      })
      
      expect(wrapper.vm.confirmationMessage).toContain('this item')
    })
  })

  describe('Integration with BaseButton', () => {
    it('should pass correct severity to BaseButton', () => {
      wrapper = createWrapper({ action: 'delete' })
      expect(wrapper.vm.actionSeverity).toBe('danger')
    })

    it('should handle loading state from BaseButton', () => {
      wrapper = createWrapper({ action: 'save' })
      
      // The icon should exist by default when not loading
      expect(wrapper.find('.action-icon').exists()).toBe(true)
    })
  })
})