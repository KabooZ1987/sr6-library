import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useLoadingState, useGlobalLoadingState, isGlobalLoading } from '../useLoadingState'

// Mock timers
vi.useFakeTimers()

describe('useLoadingState', () => {
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

  describe('Basic Loading State Management', () => {
    it('should set and get loading state', () => {
      const { setLoading, isLoading } = useLoadingState()
      
      expect(isLoading('test-key')).toBe(false)
      
      setLoading('test-key', true)
      expect(isLoading('test-key')).toBe(true)
      
      setLoading('test-key', false)
      expect(isLoading('test-key')).toBe(false)
    })

    it('should handle multiple loading keys', () => {
      const { setLoading, isLoading, getLoadingKeys } = useLoadingState()
      
      setLoading('key1', true)
      setLoading('key2', true)
      setLoading('key3', true)
      
      expect(isLoading('key1')).toBe(true)
      expect(isLoading('key2')).toBe(true)
      expect(isLoading('key3')).toBe(true)
      expect(getLoadingKeys()).toHaveLength(3)
      expect(getLoadingKeys()).toContain('key1')
      expect(getLoadingKeys()).toContain('key2')
      expect(getLoadingKeys()).toContain('key3')
    })

    it('should check if any loading is active', () => {
      const { setLoading, isAnyLoading } = useLoadingState()
      
      expect(isAnyLoading()).toBe(false)
      
      setLoading('key1', true)
      expect(isAnyLoading()).toBe(true)
      
      setLoading('key2', true)
      expect(isAnyLoading()).toBe(true)
      
      setLoading('key1', false)
      expect(isAnyLoading()).toBe(true)
      
      setLoading('key2', false)
      expect(isAnyLoading()).toBe(false)
    })
  })

  describe('Loading State with Metadata', () => {
    it('should store and retrieve metadata', () => {
      const { setLoading, getLoadingState } = useLoadingState()
      const metadata = { userId: 123, action: 'save' }
      
      setLoading('test-key', true, metadata)
      
      const state = getLoadingState('test-key')
      expect(state).toBeDefined()
      expect(state?.metadata).toEqual(metadata)
      expect(state?.loading).toBe(true)
      expect(state?.key).toBe('test-key')
      expect(state?.timestamp).toBeTypeOf('number')
    })

    it('should return undefined for non-existent keys', () => {
      const { getLoadingState } = useLoadingState()
      
      expect(getLoadingState('non-existent')).toBeUndefined()
    })
  })

  describe('Clear Operations', () => {
    it('should clear specific loading state', () => {
      const { setLoading, isLoading, clearLoading } = useLoadingState()
      
      setLoading('key1', true)
      setLoading('key2', true)
      
      expect(isLoading('key1')).toBe(true)
      expect(isLoading('key2')).toBe(true)
      
      clearLoading('key1')
      
      expect(isLoading('key1')).toBe(false)
      expect(isLoading('key2')).toBe(true)
    })

    it('should clear all loading states', () => {
      const { setLoading, isLoading, clearAllLoading } = useLoadingState()
      
      setLoading('key1', true)
      setLoading('key2', true)
      setLoading('key3', true)
      
      expect(isLoading('key1')).toBe(true)
      expect(isLoading('key2')).toBe(true)
      expect(isLoading('key3')).toBe(true)
      
      clearAllLoading()
      
      expect(isLoading('key1')).toBe(false)
      expect(isLoading('key2')).toBe(false)
      expect(isLoading('key3')).toBe(false)
    })
  })

  describe('Global vs Local State', () => {
    it('should use global state by default', () => {
      const instance1 = useLoadingState()
      const instance2 = useLoadingState()
      
      instance1.setLoading('shared-key', true)
      
      expect(instance2.isLoading('shared-key')).toBe(true)
    })

    it('should use separate state for different global keys', () => {
      const instance1 = useLoadingState({ globalKey: 'app1' })
      const instance2 = useLoadingState({ globalKey: 'app2' })
      
      instance1.setLoading('test-key', true)
      
      expect(instance1.isLoading('test-key')).toBe(true)
      expect(instance2.isLoading('test-key')).toBe(false)
    })

    it('should prefix keys with global key', () => {
      const instance = useLoadingState({ globalKey: 'myapp' })
      
      instance.setLoading('test-key', true)
      
      const states = instance.getAllLoadingStates()
      expect(states).toHaveLength(1)
      expect(states[0].key).toBe('myapp:test-key')
    })
  })

  describe('Global Loading State Helper', () => {
    it('should work with global loading state helper', () => {
      const globalState = useGlobalLoadingState()
      
      globalState.setLoading('global-key', true)
      
      expect(globalState.isLoading('global-key')).toBe(true)
      expect(isGlobalLoading.value).toBe(true)
      
      globalState.setLoading('global-key', false)
      
      expect(isGlobalLoading.value).toBe(false)
    })

    it('should reflect global loading state in computed property', () => {
      const globalState = useGlobalLoadingState()
      
      expect(isGlobalLoading.value).toBe(false)
      
      globalState.setLoading('key1', true)
      expect(isGlobalLoading.value).toBe(true)
      
      globalState.setLoading('key2', true)
      expect(isGlobalLoading.value).toBe(true)
      
      globalState.setLoading('key1', false)
      expect(isGlobalLoading.value).toBe(true)
      
      globalState.setLoading('key2', false)
      expect(isGlobalLoading.value).toBe(false)
    })
  })

  describe('Auto-cleanup', () => {
    it('should cleanup old entries when enabled', () => {
      const { setLoading, isLoading, getAllLoadingStates } = useLoadingState({
        autoCleanup: true,
        maxAge: 1000
      })
      
      setLoading('old-key', true)
      expect(isLoading('old-key')).toBe(true)
      expect(getAllLoadingStates()).toHaveLength(1)
      
      // Fast-forward time beyond maxAge
      vi.advanceTimersByTime(1500)
      
      // Accessing should trigger cleanup
      expect(isLoading('old-key')).toBe(false)
      expect(getAllLoadingStates()).toHaveLength(0)
    })

    it('should not cleanup when disabled', () => {
      const { setLoading, isLoading } = useLoadingState({
        autoCleanup: false,
        maxAge: 1000
      })
      
      setLoading('persistent-key', true)
      expect(isLoading('persistent-key')).toBe(true)
      
      // Fast-forward time beyond maxAge
      vi.advanceTimersByTime(1500)
      
      // Should still be loading since cleanup is disabled
      expect(isLoading('persistent-key')).toBe(true)
    })

    it('should cleanup on isAnyLoading check', () => {
      const { setLoading, isAnyLoading } = useLoadingState({
        autoCleanup: true,
        maxAge: 1000
      })
      
      setLoading('temp-key', true)
      expect(isAnyLoading()).toBe(true)
      
      // Fast-forward time
      vi.advanceTimersByTime(1500)
      
      // Should cleanup and return false
      expect(isAnyLoading()).toBe(false)
    })

    it('should cleanup on getLoadingKeys call', () => {
      const { setLoading, getLoadingKeys } = useLoadingState({
        autoCleanup: true,
        maxAge: 1000
      })
      
      setLoading('temp-key1', true)
      setLoading('temp-key2', true)
      expect(getLoadingKeys()).toHaveLength(2)
      
      // Fast-forward time
      vi.advanceTimersByTime(1500)
      
      // Should cleanup and return empty array
      expect(getLoadingKeys()).toHaveLength(0)
    })
  })

  describe('Get All Loading States', () => {
    it('should return all loading states with metadata', () => {
      const { setLoading, getAllLoadingStates } = useLoadingState()
      
      setLoading('key1', true, { type: 'save' })
      setLoading('key2', true, { type: 'delete' })
      
      const states = getAllLoadingStates()
      
      expect(states).toHaveLength(2)
      expect(states.find(s => s.key === 'key1')?.metadata).toEqual({ type: 'save' })
      expect(states.find(s => s.key === 'key2')?.metadata).toEqual({ type: 'delete' })
    })

    it('should return empty array when no loading states', () => {
      const { getAllLoadingStates } = useLoadingState()
      
      expect(getAllLoadingStates()).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle setting same key multiple times', () => {
      const { setLoading, isLoading, getLoadingKeys } = useLoadingState()
      
      setLoading('same-key', true)
      setLoading('same-key', true)
      setLoading('same-key', true)
      
      expect(isLoading('same-key')).toBe(true)
      expect(getLoadingKeys()).toHaveLength(1)
      
      setLoading('same-key', false)
      expect(isLoading('same-key')).toBe(false)
      expect(getLoadingKeys()).toHaveLength(0)
    })

    it('should handle clearing non-existent keys', () => {
      const { clearLoading, isLoading } = useLoadingState()
      
      // Should not throw error
      clearLoading('non-existent')
      expect(isLoading('non-existent')).toBe(false)
    })

    it('should handle empty string keys', () => {
      const { setLoading, isLoading } = useLoadingState()
      
      setLoading('', true)
      expect(isLoading('')).toBe(true)
      
      setLoading('', false)
      expect(isLoading('')).toBe(false)
    })
  })
})