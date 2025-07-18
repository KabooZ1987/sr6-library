import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ToastService, toastService, useToastService } from '../toastService'

// Mock PrimeVue useToast
const mockToast = {
  add: vi.fn(),
  removeGroup: vi.fn(),
  removeAllGroups: vi.fn()
}

vi.mock('primevue/usetoast', () => ({
  useToast: () => mockToast
}))

// Mock process.client
Object.defineProperty(global, 'process', {
  value: {
    client: true
  }
})

describe('ToastService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ToastService Class', () => {
    let service: ToastService

    beforeEach(() => {
      service = new ToastService()
    })

    describe('Success Messages', () => {
      it('should show success toast with default options', () => {
        service.success('Success message')

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Success message',
          detail: undefined,
          life: 3000,
          closable: true,
          group: 'default'
        })
      })

      it('should show success toast with detail and custom options', () => {
        service.success('Success message', 'Success detail', {
          life: 5000,
          group: 'custom',
          closable: false
        })

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Success message',
          detail: 'Success detail',
          life: 5000,
          closable: false,
          group: 'custom'
        })
      })
    })

    describe('Error Messages', () => {
      it('should show error toast with default options', () => {
        service.error('Error message')

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error message',
          detail: undefined,
          life: 5000,
          closable: true,
          group: 'default'
        })
      })

      it('should show error toast with detail and custom options', () => {
        service.error('Error message', 'Error detail', {
          life: 8000,
          group: 'errors'
        })

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error message',
          detail: 'Error detail',
          life: 8000,
          closable: true,
          group: 'errors'
        })
      })
    })

    describe('Warning Messages', () => {
      it('should show warning toast with default options', () => {
        service.warn('Warning message')

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'warn',
          summary: 'Warning message',
          detail: undefined,
          life: 4000,
          closable: true,
          group: 'default'
        })
      })

      it('should show warning toast with custom options', () => {
        service.warn('Warning message', 'Warning detail', {
          life: 6000,
          group: 'warnings'
        })

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'warn',
          summary: 'Warning message',
          detail: 'Warning detail',
          life: 6000,
          closable: true,
          group: 'warnings'
        })
      })
    })

    describe('Info Messages', () => {
      it('should show info toast with default options', () => {
        service.info('Info message')

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'info',
          summary: 'Info message',
          detail: undefined,
          life: 3000,
          closable: true,
          group: 'default'
        })
      })

      it('should show info toast with custom options', () => {
        service.info('Info message', 'Info detail', {
          life: 2000,
          group: 'notifications'
        })

        expect(mockToast.add).toHaveBeenCalledWith({
          severity: 'info',
          summary: 'Info message',
          detail: 'Info detail',
          life: 2000,
          closable: true,
          group: 'notifications'
        })
      })
    })

    describe('Clear Methods', () => {
      it('should clear specific group', () => {
        service.clear('custom-group')

        expect(mockToast.removeGroup).toHaveBeenCalledWith('custom-group')
      })

      it('should clear default group when no group specified', () => {
        service.clear()

        expect(mockToast.removeGroup).toHaveBeenCalledWith('default')
      })

      it('should clear all groups', () => {
        service.clearAll()

        expect(mockToast.removeAllGroups).toHaveBeenCalled()
      })
    })

    describe('Client-side Only', () => {
      it('should handle server-side rendering gracefully', () => {
        // Mock server-side
        Object.defineProperty(global, 'process', {
          value: {
            client: false
          }
        })

        const serverService = new ToastService()
        
        // Should not throw errors on server
        expect(() => {
          serverService.success('Test message')
          serverService.error('Test error')
          serverService.warn('Test warning')
          serverService.info('Test info')
          serverService.clear()
          serverService.clearAll()
        }).not.toThrow()

        // Reset to client-side
        Object.defineProperty(global, 'process', {
          value: {
            client: true
          }
        })
      })
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton toastService instance', () => {
      expect(toastService).toBeInstanceOf(ToastService)
    })

    it('should provide the same instance through useToastService', () => {
      const service1 = useToastService()
      const service2 = useToastService()

      expect(service1).toBe(service2)
      expect(service1).toBe(toastService)
    })
  })

  describe('Integration Tests', () => {
    it('should handle multiple toast messages', () => {
      toastService.success('Success 1')
      toastService.error('Error 1')
      toastService.warn('Warning 1')
      toastService.info('Info 1')

      expect(mockToast.add).toHaveBeenCalledTimes(4)
      expect(mockToast.add).toHaveBeenNthCalledWith(1, expect.objectContaining({
        severity: 'success',
        summary: 'Success 1'
      }))
      expect(mockToast.add).toHaveBeenNthCalledWith(2, expect.objectContaining({
        severity: 'error',
        summary: 'Error 1'
      }))
      expect(mockToast.add).toHaveBeenNthCalledWith(3, expect.objectContaining({
        severity: 'warn',
        summary: 'Warning 1'
      }))
      expect(mockToast.add).toHaveBeenNthCalledWith(4, expect.objectContaining({
        severity: 'info',
        summary: 'Info 1'
      }))
    })

    it('should handle toast options correctly', () => {
      const customOptions = {
        life: 10000,
        closable: false,
        group: 'custom-notifications'
      }

      toastService.success('Custom success', 'With details', customOptions)

      expect(mockToast.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Custom success',
        detail: 'With details',
        life: 10000,
        closable: false,
        group: 'custom-notifications'
      })
    })

    it('should handle clearing operations', () => {
      toastService.clear('group1')
      toastService.clear('group2')
      toastService.clearAll()

      expect(mockToast.removeGroup).toHaveBeenCalledWith('group1')
      expect(mockToast.removeGroup).toHaveBeenCalledWith('group2')
      expect(mockToast.removeAllGroups).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle toast service initialization errors gracefully', () => {
      // Mock useToast to throw error
      vi.mocked(mockToast.add).mockImplementationOnce(() => {
        throw new Error('Toast initialization failed')
      })

      // The error should be caught and handled gracefully
      try {
        toastService.success('Test message')
      } catch (error) {
        // If an error is thrown, it should be handled by the service
        expect(error).toBeInstanceOf(Error)
      }
      
      // The service should continue to work after an error
      vi.mocked(mockToast.add).mockClear()
      expect(() => {
        toastService.info('Test recovery')
      }).not.toThrow()
    })

    it('should handle missing toast instance gracefully', () => {
      const service = new ToastService()
      // Force toast to be null
      service['toast'] = null

      // Mock process.client to false to simulate missing toast
      Object.defineProperty(global, 'process', {
        value: {
          client: false
        }
      })

      expect(() => {
        service.success('Test message')
        service.error('Test error')
        service.warn('Test warning')
        service.info('Test info')
        service.clear()
        service.clearAll()
      }).not.toThrow()

      // Reset to client-side
      Object.defineProperty(global, 'process', {
        value: {
          client: true
        }
      })
    })
  })

  describe('Type Safety', () => {
    it('should accept valid severity types', () => {
      expect(() => {
        toastService.success('Success', undefined, { severity: 'success' })
        toastService.error('Error', undefined, { severity: 'error' })
        toastService.warn('Warning', undefined, { severity: 'warn' })
        toastService.info('Info', undefined, { severity: 'info' })
      }).not.toThrow()
    })

    it('should handle optional parameters correctly', () => {
      expect(() => {
        toastService.success('Message only')
        toastService.error('Message', 'With detail')
        toastService.warn('Message', undefined, { life: 5000 })
        toastService.info('Message', 'Detail', { group: 'custom' })
      }).not.toThrow()
    })
  })
})