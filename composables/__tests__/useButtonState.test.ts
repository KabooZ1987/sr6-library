import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useButtonState } from '../useButtonState'

// Mock the error service
const mockErrorService = {
  executeWithRetry: vi.fn(),
  getUserFriendlyMessage: vi.fn(),
  shouldRetry: vi.fn()
}

vi.mock('~/services/errorService', () => ({
  useErrorService: () => mockErrorService
}))

describe('useButtonState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { state, computedDisabled } = useButtonState()
      
      expect(state.enabled).toBe(true)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.success).toBe(false)
      expect(state.retryCount).toBe(0)
      expect(computedDisabled.value).toBe(false)
    })

    it('should initialize with custom options', () => {
      const { state } = useButtonState({ initialEnabled: false })
      
      expect(state.enabled).toBe(false)
    })

    it('should compute disabled state correctly', () => {
      const { state, computedDisabled, setEnabled } = useButtonState()
      
      expect(computedDisabled.value).toBe(false)
      
      setEnabled(false)
      expect(computedDisabled.value).toBe(true)
      
      setEnabled(true)
      state.loading = true
      expect(computedDisabled.value).toBe(true)
    })
  })

  describe('execute with error service', () => {
    it('should execute action successfully with error service', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      mockErrorService.executeWithRetry.mockResolvedValue(undefined)
      
      const { execute, state } = useButtonState({
        component: 'TestComponent',
        action: 'testAction'
      })
      
      await execute(action)
      
      expect(mockErrorService.executeWithRetry).toHaveBeenCalledWith(
        action,
        { component: 'TestComponent', action: action.name || 'button-action' },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          retryCondition: mockErrorService.shouldRetry
        }
      )
      
      expect(state.success).toBe(true)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should handle errors with user-friendly messages', async () => {
      const error = new Error('Network error')
      const action = vi.fn()
      
      mockErrorService.executeWithRetry.mockRejectedValue(error)
      mockErrorService.getUserFriendlyMessage.mockReturnValue('Connection failed. Please try again.')
      
      const { execute, state } = useButtonState()
      
      await expect(execute(action)).rejects.toThrow('Network error')
      
      expect(mockErrorService.getUserFriendlyMessage).toHaveBeenCalledWith(error)
      expect(state.error).toBe('Connection failed. Please try again.')
      expect(state.loading).toBe(false)
      expect(state.success).toBe(false)
    })

    it('should set loading state during execution', async () => {
      let resolveAction: () => void
      const actionPromise = new Promise<void>(resolve => {
        resolveAction = resolve
      })
      const action = vi.fn().mockReturnValue(actionPromise)
      mockErrorService.executeWithRetry.mockImplementation(() => actionPromise)
      
      const { execute, state } = useButtonState()
      
      const executePromise = execute(action)
      
      // Should be loading immediately
      expect(state.loading).toBe(true)
      
      // Resolve the action
      resolveAction!()
      await executePromise
      
      expect(state.loading).toBe(false)
    }, 1000)

    it('should not execute when disabled', async () => {
      const action = vi.fn()
      const { execute, setEnabled } = useButtonState()
      
      setEnabled(false)
      
      await execute(action)
      
      expect(action).not.toHaveBeenCalled()
      expect(mockErrorService.executeWithRetry).not.toHaveBeenCalled()
    })

    it('should clear success state after duration', async () => {
      const action = vi.fn()
      mockErrorService.executeWithRetry.mockResolvedValue(undefined)
      
      const { execute, state } = useButtonState({ successDuration: 1000 })
      
      await execute(action)
      
      expect(state.success).toBe(true)
      
      vi.advanceTimersByTime(1000)
      
      expect(state.success).toBe(false)
    })

    it('should clear error state after duration', async () => {
      const error = new Error('Test error')
      const action = vi.fn()
      
      mockErrorService.executeWithRetry.mockRejectedValue(error)
      mockErrorService.getUserFriendlyMessage.mockReturnValue('Test error message')
      
      const { execute, state } = useButtonState({ errorDuration: 2000 })
      
      await expect(execute(action)).rejects.toThrow()
      
      expect(state.error).toBe('Test error message')
      
      vi.advanceTimersByTime(2000)
      
      expect(state.error).toBe(null)
    })
  })

  describe('execute without error service', () => {
    it('should fall back to original retry logic when error service is disabled', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      
      const { execute, state } = useButtonState({ enableErrorService: false })
      
      await execute(action)
      
      expect(mockErrorService.executeWithRetry).not.toHaveBeenCalled()
      expect(state.success).toBe(true)
    })

    it('should retry failed actions with exponential backoff', async () => {
      const action = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue(undefined)
      
      const { execute, state } = useButtonState({ 
        enableErrorService: false,
        retryAttempts: 3,
        retryDelay: 100
      })
      
      const promise = execute(action)
      
      // Fast-forward through delays
      await vi.advanceTimersByTimeAsync(500)
      await vi.advanceTimersByTimeAsync(1000)
      
      await promise
      
      expect(action).toHaveBeenCalledTimes(3)
      expect(state.success).toBe(true)
    })

    it('should fail after max retries without error service', async () => {
      const error = new Error('Persistent failure')
      const action = vi.fn().mockRejectedValue(error)
      
      const { execute, state } = useButtonState({ 
        enableErrorService: false,
        retryAttempts: 2
      })
      
      // Fast-forward through delays and handle the promise rejection
      try {
        const promise = execute(action)
        await vi.advanceTimersByTimeAsync(5000)
        await promise
        // Should not reach here
        expect(true).toBe(false)
      } catch (thrownError) {
        expect(thrownError.message).toBe('Persistent failure')
      }
      
      expect(action).toHaveBeenCalledTimes(3) // Initial + 2 retries
      expect(state.error).toBe('Persistent failure')
    })
  })

  describe('retry functionality', () => {
    it('should retry the last action', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      mockErrorService.executeWithRetry.mockResolvedValue(undefined)
      
      const { execute, retry } = useButtonState()
      
      await execute(action)
      await retry()
      
      expect(mockErrorService.executeWithRetry).toHaveBeenCalledTimes(2)
    })

    it('should throw error when no action to retry', async () => {
      const { retry } = useButtonState()
      
      await expect(retry()).rejects.toThrow('No action to retry')
    })
  })

  describe('state management', () => {
    it('should reset state correctly', () => {
      const { state, reset } = useButtonState()
      
      state.loading = true
      state.error = 'Test error'
      state.success = true
      state.retryCount = 3
      
      reset()
      
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.success).toBe(false)
      expect(state.retryCount).toBe(0)
    })

    it('should set enabled state', () => {
      const { state, setEnabled } = useButtonState()
      
      expect(state.enabled).toBe(true)
      
      setEnabled(false)
      expect(state.enabled).toBe(false)
      
      setEnabled(true)
      expect(state.enabled).toBe(true)
    })

    it('should clear timeouts on reset', async () => {
      const action = vi.fn()
      mockErrorService.executeWithRetry.mockResolvedValue(undefined)
      
      const { execute, reset, state } = useButtonState({ successDuration: 1000 })
      
      await execute(action)
      expect(state.success).toBe(true)
      
      reset()
      
      vi.advanceTimersByTime(1000)
      
      // Success should remain false after reset, even after timeout
      expect(state.success).toBe(false)
    })
  })

  describe('error handling edge cases', () => {
    it('should handle non-Error objects thrown by actions', async () => {
      const action = vi.fn().mockRejectedValue('String error')
      mockErrorService.executeWithRetry.mockRejectedValue('String error')
      mockErrorService.getUserFriendlyMessage.mockReturnValue('An error occurred')
      
      const { execute, state } = useButtonState()
      
      await expect(execute(action)).rejects.toBe('String error')
      
      expect(state.error).toBe('An error occurred')
    })

    it('should handle actions that return non-promise values', async () => {
      const action = vi.fn().mockReturnValue('immediate result')
      mockErrorService.executeWithRetry.mockResolvedValue('immediate result')
      
      const { execute, state } = useButtonState()
      
      await execute(action)
      
      expect(state.success).toBe(true)
    })
  })
})