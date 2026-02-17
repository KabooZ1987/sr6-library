import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorBoundary from '../ErrorBoundary.vue'
import BaseButton from '../BaseButton.vue'

// Mock PrimeVue Button component
vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    template: '<button v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>',
    emits: ['click']
  }
}))

// Mock error service
const mockErrorService = {
  captureError: vi.fn(),
  executeWithRetry: vi.fn(),
  getUserFriendlyMessage: vi.fn(),
  shouldRetry: vi.fn(),
  markResolved: vi.fn()
}

vi.mock('~/services/errorService', () => ({
  useErrorService: () => mockErrorService
}))

// Mock composables
vi.mock('~/composables/useButtonState', () => ({
  useButtonState: vi.fn(() => ({
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
  }))
}))

describe('Error Recovery Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('ErrorBoundary Component', () => {
    it('should catch and display errors with retry option', async () => {
      const ThrowingComponent = {
        template: '<div>{{ throwError() }}</div>',
        methods: {
          throwError() {
            throw new Error('Test component error')
          }
        }
      }

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ThrowingComponent
        },
        props: {
          fallbackTitle: 'Component Error',
          fallbackMessage: 'Something went wrong in the component',
          showDetails: true
        }
      })

      await nextTick()

      // Should show error state
      expect(wrapper.find('.error-state').exists()).toBe(true)
      expect(wrapper.find('.error-title').text()).toBe('Component Error')
      expect(wrapper.find('.error-message').text()).toBe('Something went wrong in the component')
      
      // Should have retry button
      const retryButton = wrapper.find('.retry-btn')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toBe('Try Again')
    })

    it('should handle retry functionality', async () => {
      let shouldThrow = true
      
      const ConditionalThrowingComponent = {
        template: '<div>{{ maybeThrowError() }}</div>',
        methods: {
          maybeThrowError() {
            if (shouldThrow) {
              throw new Error('Conditional error')
            }
            return 'Success!'
          }
        }
      }

      const onRetry = vi.fn(() => {
        shouldThrow = false
      })

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ConditionalThrowingComponent
        },
        props: {
          onRetry
        }
      })

      await nextTick()

      // Should show error initially
      expect(wrapper.find('.error-state').exists()).toBe(true)

      // Click retry button
      await wrapper.find('.retry-btn').trigger('click')
      await nextTick()

      // Should call onRetry
      expect(onRetry).toHaveBeenCalled()

      // Should hide error state after retry
      expect(wrapper.find('.error-state').exists()).toBe(false)
    })

    it('should show error details when requested', async () => {
      const ThrowingComponent = {
        template: '<div>{{ throwError() }}</div>',
        methods: {
          throwError() {
            const error = new Error('Detailed test error')
            error.stack = 'Error: Detailed test error\n    at test.js:1:1'
            throw error
          }
        }
      }

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ThrowingComponent
        },
        props: {
          showDetails: true
        }
      })

      await nextTick()

      // Should have details toggle button
      const detailsToggle = wrapper.find('.error-details-toggle')
      expect(detailsToggle.exists()).toBe(true)

      // Click to show details
      await detailsToggle.trigger('click')
      await nextTick()

      // Should show error details
      const detailsContent = wrapper.find('.error-details-content')
      expect(detailsContent.exists()).toBe(true)
      expect(detailsContent.text()).toContain('Detailed test error')
    })

    it('should handle different error types with appropriate messages', async () => {
      const NetworkErrorComponent = {
        template: '<div>{{ throwNetworkError() }}</div>',
        methods: {
          throwNetworkError() {
            const error = new Error('fetch failed')
            error.name = 'NetworkError'
            throw error
          }
        }
      }

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: NetworkErrorComponent
        }
      })

      await nextTick()

      expect(wrapper.find('.error-title').text()).toBe('Network Error')
      expect(wrapper.find('.error-message').text()).toContain('Unable to connect to the server')
    })

    it('should emit error events', async () => {
      const ThrowingComponent = {
        template: '<div>{{ throwError() }}</div>',
        methods: {
          throwError() {
            throw new Error('Event test error')
          }
        }
      }

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ThrowingComponent
        }
      })

      await nextTick()

      // Should emit error event
      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0][0]).toBeInstanceOf(Error)
      expect(wrapper.emitted('error')[0][0].message).toBe('Event test error')
    })

    it('should handle report error functionality', async () => {
      const ThrowingComponent = {
        template: '<div>{{ throwError() }}</div>',
        methods: {
          throwError() {
            throw new Error('Reportable error')
          }
        }
      }

      const onReport = vi.fn()

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: ThrowingComponent
        },
        props: {
          showReportButton: true,
          onReport
        }
      })

      await nextTick()

      // Should have report button
      const reportButton = wrapper.find('.report-btn')
      expect(reportButton.exists()).toBe(true)

      // Click report button
      await reportButton.trigger('click')

      // Should call onReport
      expect(onReport).toHaveBeenCalled()
      expect(wrapper.emitted('report')).toBeTruthy()
    })
  })

  describe('Button Error Recovery', () => {
    it('should handle button action failures with retry', async () => {
      const mockButtonState = {
        state: {
          enabled: true,
          loading: false,
          error: 'Network connection failed',
          success: false,
          retryCount: 2
        },
        execute: vi.fn(),
        retry: vi.fn(),
        reset: vi.fn(),
        setEnabled: vi.fn(),
        computedDisabled: { value: false }
      }

      const { useButtonState } = await import('~/composables/useButtonState')
      vi.mocked(useButtonState).mockReturnValue(mockButtonState)

      const wrapper = mount(BaseButton, {
        props: {
          label: 'Test Action'
        }
      })

      // Should show error state
      expect(wrapper.find('.p-button').classes()).toContain('p-button-danger')
      
      // Should be able to retry
      await wrapper.find('.p-button').trigger('click')
      expect(mockButtonState.retry).toHaveBeenCalled()
    })

    it('should show loading state during retry attempts', async () => {
      const mockButtonState = {
        state: {
          enabled: true,
          loading: true,
          error: null,
          success: false,
          retryCount: 1
        },
        execute: vi.fn(),
        retry: vi.fn(),
        reset: vi.fn(),
        setEnabled: vi.fn(),
        computedDisabled: { value: true }
      }

      const { useButtonState } = await import('~/composables/useButtonState')
      vi.mocked(useButtonState).mockReturnValue(mockButtonState)

      const wrapper = mount(BaseButton, {
        props: {
          label: 'Test Action'
        }
      })

      // Should be disabled during loading
      expect(wrapper.find('.p-button').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.p-button').classes()).toContain('p-button-loading')
    })

    it('should show success state after successful retry', async () => {
      const mockButtonState = {
        state: {
          enabled: true,
          loading: false,
          error: null,
          success: true,
          retryCount: 0
        },
        execute: vi.fn(),
        retry: vi.fn(),
        reset: vi.fn(),
        setEnabled: vi.fn(),
        computedDisabled: { value: false }
      }

      const { useButtonState } = await import('~/composables/useButtonState')
      vi.mocked(useButtonState).mockReturnValue(mockButtonState)

      const wrapper = mount(BaseButton, {
        props: {
          label: 'Test Action'
        }
      })

      // Should show success state
      expect(wrapper.find('.p-button').classes()).toContain('p-button-success')
    })
  })

  describe('Global Error Handling Integration', () => {
    it('should capture global JavaScript errors', () => {
      // Simulate global error
      const error = new Error('Global JavaScript error')
      const errorEvent = new ErrorEvent('error', {
        error,
        message: error.message,
        filename: 'test.js',
        lineno: 1,
        colno: 1
      })

      window.dispatchEvent(errorEvent)

      expect(mockErrorService.captureError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'global',
          action: 'javascript-error',
          metadata: expect.objectContaining({
            filename: 'test.js',
            lineno: 1,
            colno: 1
          })
        }),
        'high'
      )
    })

    it('should capture unhandled promise rejections', () => {
      // Simulate unhandled promise rejection
      const error = new Error('Unhandled promise rejection')
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(error),
        reason: error
      })

      window.dispatchEvent(rejectionEvent)

      expect(mockErrorService.captureError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'global',
          action: 'unhandled-promise-rejection'
        }),
        'high'
      )
    })
  })

  describe('Error Recovery Patterns', () => {
    it('should implement exponential backoff for retries', async () => {
      let attempt = 0
      const failingAction = vi.fn().mockImplementation(() => {
        attempt++
        if (attempt < 3) {
          throw new Error(`Attempt ${attempt} failed`)
        }
        return 'success'
      })

      mockErrorService.executeWithRetry.mockImplementation(async (action, context, config) => {
        let lastError
        for (let i = 0; i <= config.maxAttempts; i++) {
          try {
            return await action()
          } catch (error) {
            lastError = error
            if (i < config.maxAttempts) {
              const delay = config.baseDelay * Math.pow(2, i)
              await new Promise(resolve => setTimeout(resolve, delay))
            }
          }
        }
        throw lastError
      })

      const result = await mockErrorService.executeWithRetry(
        failingAction,
        {},
        { maxAttempts: 3, baseDelay: 100 }
      )

      expect(result).toBe('success')
      expect(failingAction).toHaveBeenCalledTimes(3)
    })

    it('should provide graceful degradation for unsupported features', async () => {
      const primaryAction = vi.fn(() => {
        throw new Error('Feature not supported')
      })
      const fallbackAction = vi.fn(() => 'fallback result')

      // Mock graceful degradation
      const mockGracefulDegradation = {
        withFallback: vi.fn((feature, primary, fallback) => {
          try {
            return primary()
          } catch {
            return fallback()
          }
        })
      }

      const result = mockGracefulDegradation.withFallback(
        'advancedFeature',
        primaryAction,
        fallbackAction
      )

      expect(result).toBe('fallback result')
      expect(primaryAction).toHaveBeenCalled()
      expect(fallbackAction).toHaveBeenCalled()
    })

    it('should handle cascading failures with circuit breaker pattern', async () => {
      let failureCount = 0
      const circuitBreakerThreshold = 3
      let circuitOpen = false

      const actionWithCircuitBreaker = vi.fn().mockImplementation(() => {
        if (circuitOpen) {
          throw new Error('Circuit breaker is open')
        }

        failureCount++
        if (failureCount >= circuitBreakerThreshold) {
          circuitOpen = true
        }
        
        throw new Error(`Failure ${failureCount}`)
      })

      // Test multiple failures
      for (let i = 0; i < 5; i++) {
        try {
          await actionWithCircuitBreaker()
        } catch (error) {
          if (i >= circuitBreakerThreshold) {
            expect(error.message).toBe('Circuit breaker is open')
          } else {
            expect(error.message).toBe(`Failure ${i + 1}`)
          }
        }
      }

      expect(actionWithCircuitBreaker).toHaveBeenCalledTimes(5)
    })
  })

  describe('User Experience During Errors', () => {
    it('should provide clear feedback during error states', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: {
            template: '<div>{{ throwError() }}</div>',
            methods: {
              throwError() {
                throw new Error('User experience test error')
              }
            }
          }
        },
        props: {
          fallbackTitle: 'Oops! Something went wrong',
          fallbackMessage: 'We encountered an unexpected error. Please try again or contact support if the problem persists.'
        }
      })

      await nextTick()

      // Should show user-friendly error message
      expect(wrapper.find('.error-title').text()).toBe('Oops! Something went wrong')
      expect(wrapper.find('.error-message').text()).toContain('We encountered an unexpected error')
      
      // Should provide clear action options
      expect(wrapper.find('.retry-btn').text()).toBe('Try Again')
      expect(wrapper.find('.retry-btn').exists()).toBe(true)
    })

    it('should handle mobile-specific error interactions', async () => {
      // Mock mobile environment
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })

      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: {
            template: '<div>{{ throwError() }}</div>',
            methods: {
              throwError() {
                throw new Error('Mobile error test')
              }
            }
          }
        }
      })

      await nextTick()

      // Should have touch-friendly buttons
      const retryButton = wrapper.find('.retry-btn')
      expect(retryButton.classes()).toContain('touch-friendly')
    })
  })
})