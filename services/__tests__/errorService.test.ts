import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { errorService, useErrorService } from '../errorService'

// Mock console methods
const consoleMock = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

vi.stubGlobal('console', consoleMock)

describe('ErrorService', () => {
  beforeEach(() => {
    errorService.clearAllErrors()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('captureError', () => {
    it('should capture and store error with context', () => {
      const error = new Error('Test error')
      const context = { component: 'TestComponent', action: 'testAction' }
      
      const errorId = errorService.captureError(error, context, 'medium')
      
      expect(errorId).toBeDefined()
      expect(errorId).toMatch(/^error_\d+_\d+$/)
      
      const capturedError = errorService.getError(errorId)
      expect(capturedError).toBeDefined()
      expect(capturedError!.error).toBe(error)
      expect(capturedError!.context.component).toBe('TestComponent')
      expect(capturedError!.context.action).toBe('testAction')
      expect(capturedError!.severity).toBe('medium')
    })

    it('should log error when logging is enabled', () => {
      const error = new Error('Test error')
      
      errorService.captureError(error, {}, 'high')
      
      expect(consoleMock.error).toHaveBeenCalledWith(
        '[HIGH] Error: Test error',
        expect.objectContaining({
          errorId: expect.stringMatching(/^error_\d+_\d+$/),
          context: expect.any(Object),
          stack: expect.any(String)
        })
      )
    })

    it('should maintain error history with size limit', () => {
      // Create more errors than the default limit (100)
      for (let i = 0; i < 105; i++) {
        errorService.captureError(new Error(`Error ${i}`), {}, 'low')
      }
      
      const history = errorService.getErrorHistory()
      expect(history.length).toBe(100)
      expect(history[0].error.message).toBe('Error 104') // Most recent first
    })
  })

  describe('executeWithRetry', () => {
    it('should execute action successfully on first try', async () => {
      const action = vi.fn().mockResolvedValue('success')
      
      const result = await errorService.executeWithRetry(action)
      
      expect(result).toBe('success')
      expect(action).toHaveBeenCalledTimes(1)
    })

    it('should retry failed actions up to max attempts', async () => {
      const action = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')
      
      const result = await errorService.executeWithRetry(action, {}, { maxAttempts: 3 })
      
      expect(result).toBe('success')
      expect(action).toHaveBeenCalledTimes(3)
    })

    it('should throw error after max retries exceeded', async () => {
      const error = new Error('Persistent failure')
      const action = vi.fn().mockRejectedValue(error)
      
      await expect(
        errorService.executeWithRetry(action, {}, { maxAttempts: 2 })
      ).rejects.toThrow('Persistent failure')
      
      expect(action).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should respect retry condition', async () => {
      const error = new Error('ValidationError')
      error.name = 'ValidationError'
      const action = vi.fn().mockRejectedValue(error)
      
      await expect(
        errorService.executeWithRetry(action, {}, {
          maxAttempts: 3,
          retryCondition: (err) => err.name !== 'ValidationError'
        })
      ).rejects.toThrow('ValidationError')
      
      expect(action).toHaveBeenCalledTimes(1) // No retries for validation errors
    })

    it('should use exponential backoff with jitter', async () => {
      vi.useFakeTimers()
      
      const action = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success')
      
      const promise = errorService.executeWithRetry(action, {}, {
        maxAttempts: 3,
        baseDelay: 100,
        backoffMultiplier: 2
      })
      
      // Fast-forward through delays
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(2000)
      
      const result = await promise
      expect(result).toBe('success')
      
      vi.useRealTimers()
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return specific message for network errors', () => {
      const error = new Error('fetch failed')
      const message = errorService.getUserFriendlyMessage(error)
      
      expect(message).toBe('Unable to connect to the server. Please check your internet connection and try again.')
    })

    it('should return specific message for timeout errors', () => {
      const error = new Error('Request timeout')
      const message = errorService.getUserFriendlyMessage(error)
      
      expect(message).toBe('The request took too long to complete. Please try again.')
    })

    it('should return specific message for validation errors', () => {
      const error = new Error('Invalid input')
      error.name = 'ValidationError'
      const message = errorService.getUserFriendlyMessage(error)
      
      expect(message).toBe('Please check your input and try again.')
    })

    it('should return generic message for unknown errors', () => {
      const error = new Error('Unknown error')
      const message = errorService.getUserFriendlyMessage(error)
      
      expect(message).toBe('An unexpected error occurred. Please try again or contact support if the problem persists.')
    })
  })

  describe('getRecoverySuggestions', () => {
    it('should return network-specific suggestions for network errors', () => {
      const error = new Error('fetch failed')
      const suggestions = errorService.getRecoverySuggestions(error)
      
      expect(suggestions).toContain('Check your internet connection')
      expect(suggestions).toContain('Try refreshing the page')
      expect(suggestions).toContain('Wait a moment and try again')
    })

    it('should return timeout-specific suggestions for timeout errors', () => {
      const error = new Error('Request timeout')
      const suggestions = errorService.getRecoverySuggestions(error)
      
      expect(suggestions).toContain('Try again with a slower connection')
      expect(suggestions).toContain('Check if the server is responding')
    })

    it('should always include generic suggestions', () => {
      const error = new Error('Any error')
      const suggestions = errorService.getRecoverySuggestions(error)
      
      expect(suggestions).toContain('Contact support if the problem continues')
    })
  })

  describe('shouldRetry', () => {
    it('should not retry validation errors', () => {
      const error = new Error('Invalid input')
      error.name = 'ValidationError'
      
      expect(errorService.shouldRetry(error)).toBe(false)
    })

    it('should not retry permission errors', () => {
      const error = new Error('Access denied')
      error.name = 'PermissionError'
      
      expect(errorService.shouldRetry(error)).toBe(false)
    })

    it('should not retry 4xx client errors', () => {
      const error = new Error('404 Not Found')
      
      expect(errorService.shouldRetry(error)).toBe(false)
    })

    it('should retry network errors', () => {
      const error = new Error('fetch failed')
      
      expect(errorService.shouldRetry(error)).toBe(true)
    })

    it('should retry timeout errors', () => {
      const error = new Error('Request timeout')
      
      expect(errorService.shouldRetry(error)).toBe(true)
    })
  })

  describe('error management', () => {
    it('should mark errors as resolved', () => {
      const error = new Error('Test error')
      const errorId = errorService.captureError(error)
      
      errorService.markResolved(errorId)
      
      const capturedError = errorService.getError(errorId)
      expect(capturedError!.resolved).toBe(true)
    })

    it('should get only active errors', () => {
      const error1 = new Error('Active error')
      const error2 = new Error('Resolved error')
      
      const errorId1 = errorService.captureError(error1)
      const errorId2 = errorService.captureError(error2)
      
      errorService.markResolved(errorId2)
      
      const activeErrors = errorService.getActiveErrors()
      expect(activeErrors).toHaveLength(1)
      expect(activeErrors[0].id).toBe(errorId1)
    })

    it('should clear resolved errors', () => {
      const error1 = new Error('Active error')
      const error2 = new Error('Resolved error')
      
      const errorId1 = errorService.captureError(error1)
      const errorId2 = errorService.captureError(error2)
      
      errorService.markResolved(errorId2)
      errorService.clearResolvedErrors()
      
      expect(errorService.getError(errorId1)).toBeDefined()
      expect(errorService.getError(errorId2)).toBeUndefined()
    })
  })
})

describe('useErrorService', () => {
  it('should return error service methods', () => {
    const errorServiceMethods = useErrorService()
    
    expect(errorServiceMethods.captureError).toBeDefined()
    expect(errorServiceMethods.executeWithRetry).toBeDefined()
    expect(errorServiceMethods.getUserFriendlyMessage).toBeDefined()
    expect(errorServiceMethods.getRecoverySuggestions).toBeDefined()
    expect(errorServiceMethods.shouldRetry).toBeDefined()
  })
})