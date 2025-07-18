import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ConfirmationDialog from '../ConfirmationDialog.vue'

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

describe('ConfirmationDialog', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('should render ConfirmDialog component', () => {
      wrapper = mount(ConfirmationDialog, {
        props: {
          group: 'test'
        },
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      expect(wrapper.findComponent({ name: 'ConfirmDialog' }).exists()).toBe(true)
    })

    it('should use default group when not provided', () => {
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      const confirmDialog = wrapper.findComponent({ name: 'ConfirmDialog' })
      expect(confirmDialog.props('group')).toBe('default')
    })

    it('should use custom group when provided', () => {
      wrapper = mount(ConfirmationDialog, {
        props: {
          group: 'custom-group'
        },
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      const confirmDialog = wrapper.findComponent({ name: 'ConfirmDialog' })
      expect(confirmDialog.props('group')).toBe('custom-group')
    })
  })

  describe('Icon and Styling', () => {
    it('should return correct icon class for different severities', () => {
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      const component = wrapper.vm

      expect(component.getIconClass('success')).toBe('icon-success')
      expect(component.getIconClass('info')).toBe('icon-info')
      expect(component.getIconClass('warn')).toBe('icon-warn')
      expect(component.getIconClass('error')).toBe('icon-danger')
      expect(component.getIconClass('danger')).toBe('icon-danger')
      expect(component.getIconClass()).toBe('icon-danger') // default
    })

    it('should return correct icon name for different severities', () => {
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      const component = wrapper.vm

      expect(component.getIconName('success')).toBe('pi pi-check-circle')
      expect(component.getIconName('info')).toBe('pi pi-info-circle')
      expect(component.getIconName('warn')).toBe('pi pi-exclamation-triangle')
      expect(component.getIconName('error')).toBe('pi pi-times-circle')
      expect(component.getIconName('danger')).toBe('pi pi-times-circle')
      expect(component.getIconName()).toBe('pi pi-question-circle') // default
    })
  })

  describe('Responsive Behavior', () => {
    it('should detect mobile screen size', async () => {
      window.innerWidth = 600
      
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()

      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should detect desktop screen size', async () => {
      window.innerWidth = 1200
      
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()

      expect(wrapper.vm.isMobile).toBe(false)
    })

    it('should update screen size on window resize', async () => {
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      // Start with desktop
      window.innerWidth = 1200
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(wrapper.vm.isMobile).toBe(false)

      // Change to mobile
      window.innerWidth = 600
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should clean up resize event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('Accessibility', () => {
    it('should have proper breakpoints for responsive design', () => {
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      const confirmDialog = wrapper.findComponent({ name: 'ConfirmDialog' })
      expect(confirmDialog.props('breakpoints')).toEqual({
        '1024px': '85vw',
        '768px': '95vw',
        '480px': '98vw'
      })
    })

    it('should have proper styling classes', () => {
      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      const confirmDialog = wrapper.findComponent({ name: 'ConfirmDialog' })
      expect(confirmDialog.classes()).toContain('confirmation-dialog')
    })
  })

  describe('Component Lifecycle', () => {
    it('should initialize screen size on mount', () => {
      window.innerWidth = 800

      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      expect(wrapper.vm.isMobile).toBe(true)
    })

    it('should add resize event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      wrapper = mount(ConfirmationDialog, {
        global: {
          stubs: {
            ConfirmDialog: true,
            Button: true
          }
        }
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })
})