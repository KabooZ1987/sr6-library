import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import ErrorBoundary from '../ErrorBoundary.vue'

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalConsoleError
})

describe('ErrorBoundary', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Normal Operation', () => {
    it('should render slot content when no error', () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div class="test-content">Test Content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      expect(wrapper.find('.test-content').exists()).toBe(true)
      expect(wrapper.find('.error-state').exists()).toBe(false)
    })

    it('should not show error state initially', () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.find('.error-state').exists()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should display error state when error occurs', async () => {
      wrapper = mount(ErrorBoundary, {
        props: {
          fallbackTitle: 'Custom Error Title',
          fallbackMessage: 'Custom error message'
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      const testErrorInfo = { info: 'test info' }

      // Simulate error
      await wrapper.vm.handleError(testError, testErrorInfo)
      await nextTick()

      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.find('.error-state').exists()).toBe(true)
      expect(wrapper.find('.error-title').text()).toBe('Custom Error Title')
      expect(wrapper.find('.error-message').text()).toBe('Custom error message')
    })

    it('should emit error event when error occurs', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      const testErrorInfo = { info: 'test info' }

      await wrapper.vm.handleError(testError, testErrorInfo)

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')[0]).toEqual([testError, testErrorInfo])
    })

    it('should call custom error handler when provided', async () => {
      const mockErrorHandler = vi.fn()

      wrapper = mount(ErrorBoundary, {
        props: {
          onError: mockErrorHandler
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      const testErrorInfo = { info: 'test info' }

      await wrapper.vm.handleError(testError, testErrorInfo)

      expect(mockErrorHandler).toHaveBeenCalledWith(testError, testErrorInfo)
    })
  })

  describe('Error Types and Messages', () => {
    it('should handle ChunkLoadError with specific message', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const chunkError = new Error('Loading chunk failed')
      chunkError.name = 'ChunkLoadError'

      await wrapper.vm.handleError(chunkError, {})
      await nextTick()

      expect(wrapper.find('.error-title').text()).toBe('Loading Error')
      expect(wrapper.find('.error-message').text()).toContain('Failed to load application resources')
    })

    it('should handle NetworkError with specific message', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const networkError = new Error('Network request failed')
      networkError.name = 'NetworkError'

      await wrapper.vm.handleError(networkError, {})
      await nextTick()

      expect(wrapper.find('.error-title').text()).toBe('Network Error')
      expect(wrapper.find('.error-message').text()).toContain('Unable to connect to the server')
    })

    it('should handle fetch errors with specific message', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const fetchError = new Error('fetch failed')

      await wrapper.vm.handleError(fetchError, {})
      await nextTick()

      expect(wrapper.find('.error-title').text()).toBe('Connection Error')
      expect(wrapper.find('.error-message').text()).toContain('Failed to load data')
    })

    it('should handle timeout errors with specific message', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const timeoutError = new Error('Request timeout')

      await wrapper.vm.handleError(timeoutError, {})
      await nextTick()

      expect(wrapper.find('.error-message').text()).toContain('The request timed out')
    })
  })

  describe('Error Details', () => {
    it('should show error details when showDetails is true', async () => {
      wrapper = mount(ErrorBoundary, {
        props: {
          showDetails: true
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      testError.stack = 'Error stack trace'

      await wrapper.vm.handleError(testError, { info: 'test info' })
      await nextTick()

      expect(wrapper.find('.error-details').exists()).toBe(true)
      expect(wrapper.find('.error-details-toggle').exists()).toBe(true)
    })

    it('should toggle error details visibility', async () => {
      wrapper = mount(ErrorBoundary, {
        props: {
          showDetails: true
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      await wrapper.vm.handleError(testError, {})
      await nextTick()

      expect(wrapper.vm.showErrorDetails).toBe(false)
      expect(wrapper.find('.error-details-content').exists()).toBe(false)

      await wrapper.vm.toggleErrorDetails()
      await nextTick()

      expect(wrapper.vm.showErrorDetails).toBe(true)
      expect(wrapper.find('.error-details-content').exists()).toBe(true)
    })

    it('should hide error details when showDetails is false', async () => {
      wrapper = mount(ErrorBoundary, {
        props: {
          showDetails: false
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      await wrapper.vm.handleError(testError, {})
      await nextTick()

      expect(wrapper.find('.error-details').exists()).toBe(false)
    })
  })

  describe('Recovery Actions', () => {
    it('should reset error state when retry is called', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div class="test-content">Test Content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      // Simulate error
      const testError = new Error('Test error')
      await wrapper.vm.handleError(testError, {})
      await nextTick()

      expect(wrapper.vm.hasError).toBe(true)
      expect(wrapper.find('.error-state').exists()).toBe(true)

      // Retry
      await wrapper.vm.retry()
      await nextTick()

      expect(wrapper.vm.hasError).toBe(false)
      expect(wrapper.find('.error-state').exists()).toBe(false)
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('should emit retry event when retry is called', async () => {
      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      await wrapper.vm.retry()

      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(wrapper.emitted('retry')).toHaveLength(1)
    })

    it('should call custom retry handler when provided', async () => {
      const mockRetryHandler = vi.fn()

      wrapper = mount(ErrorBoundary, {
        props: {
          onRetry: mockRetryHandler
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      await wrapper.vm.retry()

      expect(mockRetryHandler).toHaveBeenCalled()
    })

    it('should emit report event when reportError is called', async () => {
      wrapper = mount(ErrorBoundary, {
        props: {
          showReportButton: true
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      const testErrorInfo = { info: 'test info' }

      await wrapper.vm.handleError(testError, testErrorInfo)
      await wrapper.vm.reportError()

      expect(wrapper.emitted('report')).toBeTruthy()
      expect(wrapper.emitted('report')[0]).toEqual([testError, testErrorInfo])
    })

    it('should call custom report handler when provided', async () => {
      const mockReportHandler = vi.fn()

      wrapper = mount(ErrorBoundary, {
        props: {
          showReportButton: true,
          onReport: mockReportHandler
        },
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      const testError = new Error('Test error')
      const testErrorInfo = { info: 'test info' }

      await wrapper.vm.handleError(testError, testErrorInfo)
      await wrapper.vm.reportError()

      expect(mockReportHandler).toHaveBeenCalledWith(testError, testErrorInfo)
    })
  })

  describe('Responsive Behavior', () => {
    it('should detect mobile screen size', async () => {
      window.innerWidth = 600

      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
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

      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()

      expect(wrapper.vm.isMobile).toBe(false)
    })

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
    })
  })

  describe('Global Error Handling', () => {
    it('should add global error event listeners on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<div>Normal content</div>'
        },
        global: {
          stubs: {
            Button: true
          }
        }
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function))
    })
  })
})