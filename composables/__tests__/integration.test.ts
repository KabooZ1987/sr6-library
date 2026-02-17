import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useButtonState } from '../useButtonState'
import { useLoadingState, useGlobalLoadingState } from '../useLoadingState'

// Mock timers
vi.useFakeTimers()

describe('Composables Integration', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    // Clear global state between tests
    const globalState = useGlobalLoadingState()
    globalState.clearAllLoading()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.useFakeTimers()
  })

  describe('Button State with Loading State Integration', () => {
    it('should integrate button state with global loading state', async () => {
      const buttonState = useButtonState()
      const loadingState = useGlobalLoadingState()
      
      // Mock action that sets loading state
      const mockAction = vi.fn().mockImplementation(async () => {
        loadingState.setLoading('test-action', true)
        await new Promise(resolve => setTimeout(resolve, 100))
        loadingState.setLoading('test-action', false)
      })
      
      expect(loadingState.isLoading('test-action')).toBe(false)
      expect(buttonState.state.loading).toBe(false)
      
      const executePromise = buttonState.execute(mockAction)
      
      // Button should be in loading state
      expect(buttonState.state.loading).toBe(true)
      
      // Advance timers and complete execution
      await vi.advanceTimersByTimeAsync(200)
      await executePromise
      
      // Both states should be resolved
      expect(buttonState.state.loading).toBe(false)
      expect(buttonState.state.success).toBe(true)
      expect(loadingState.isLoading('test-action')).toBe(false)
    })

    it('should handle errors in integrated loading scenarios', async () => {
      const buttonState = useButtonState({ retryAttempts: 0 })
      const loadingState = useGlobalLoadingState()
      
      const mockAction = vi.fn().mockImplementation(async () => {
        loadingState.setLoading('failing-action', true)
        throw new Error('Integration test error')
      })
      
      const executePromise = buttonState.execute(mockAction)
      
      expect(buttonState.state.loading).toBe(true)
      expect(loadingState.isLoading('failing-action')).toBe(true)
      
      await expect(executePromise).rejects.toThrow('Integration test error')
      
      expect(buttonState.state.loading).toBe(false)
      expect(buttonState.state.error).toBe('Integration test error')
      expect(loadingState.isLoading('failing-action')).toBe(true) // Still set by the action
    })

    it('should work with multiple button states and shared loading state', async () => {
      const button1 = useButtonState()
      const button2 = useButtonState()
      const loadingState = useGlobalLoadingState()
      
      const action1 = vi.fn().mockImplementation(async () => {
        loadingState.setLoading('action1', true)
        await new Promise(resolve => setTimeout(resolve, 50))
        loadingState.setLoading('action1', false)
      })
      
      const action2 = vi.fn().mockImplementation(async () => {
        loadingState.setLoading('action2', true)
        await new Promise(resolve => setTimeout(resolve, 100))
        loadingState.setLoading('action2', false)
      })
      
      // Start both actions
      const promise1 = button1.execute(action1)
      const promise2 = button2.execute(action2)
      
      expect(button1.state.loading).toBe(true)
      expect(button2.state.loading).toBe(true)
      expect(loadingState.isAnyLoading()).toBe(true)
      expect(loadingState.getLoadingKeys()).toHaveLength(2)
      
      // Advance time to complete first action
      await vi.advanceTimersByTimeAsync(75)
      await promise1
      
      expect(button1.state.loading).toBe(false)
      expect(button1.state.success).toBe(true)
      expect(button2.state.loading).toBe(true)
      expect(loadingState.isLoading('action1')).toBe(false)
      expect(loadingState.isLoading('action2')).toBe(true)
      
      // Complete second action
      await vi.advanceTimersByTimeAsync(50)
      await promise2
      
      expect(button2.state.loading).toBe(false)
      expect(button2.state.success).toBe(true)
      expect(loadingState.isAnyLoading()).toBe(false)
    })
  })

  describe('Error Recovery Integration', () => {
    it('should handle retry scenarios with loading state tracking', async () => {
      const buttonState = useButtonState({ 
        retryAttempts: 2,
        retryDelay: 50
      })
      const loadingState = useLoadingState({ globalKey: 'retry-test' })
      
      let attemptCount = 0
      const mockAction = vi.fn().mockImplementation(async () => {
        attemptCount++
        loadingState.setLoading(`attempt-${attemptCount}`, true)
        
        if (attemptCount < 3) {
          loadingState.setLoading(`attempt-${attemptCount}`, false)
          throw new Error(`Attempt ${attemptCount} failed`)
        }
        
        loadingState.setLoading(`attempt-${attemptCount}`, false)
        return 'success'
      })
      
      const executePromise = buttonState.execute(mockAction)
      
      // Advance timers to handle retries
      await vi.advanceTimersByTimeAsync(300)
      
      await executePromise
      
      expect(attemptCount).toBe(3)
      expect(buttonState.state.success).toBe(true)
      expect(buttonState.state.error).toBe(null)
      expect(loadingState.isAnyLoading()).toBe(false)
    })
  })

  describe('State Cleanup Integration', () => {
    it('should properly cleanup states when components unmount', () => {
      const buttonState = useButtonState()
      const loadingState = useLoadingState({ globalKey: 'cleanup-test' })
      
      // Set some states
      buttonState.state.loading = true
      buttonState.state.error = 'Test error'
      loadingState.setLoading('test-key', true)
      
      expect(buttonState.state.loading).toBe(true)
      expect(buttonState.state.error).toBe('Test error')
      expect(loadingState.isLoading('test-key')).toBe(true)
      
      // Reset button state
      buttonState.reset()
      
      expect(buttonState.state.loading).toBe(false)
      expect(buttonState.state.error).toBe(null)
      expect(loadingState.isLoading('test-key')).toBe(true) // Should still be set
      
      // Clear loading state
      loadingState.clearAllLoading()
      
      expect(loadingState.isLoading('test-key')).toBe(false)
    })
  })
})