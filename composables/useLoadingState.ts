import { ref, computed, reactive, onBeforeUnmount } from 'vue'

export interface LoadingStateOptions {
  globalKey?: string
  autoCleanup?: boolean
  maxAge?: number
}

export interface LoadingStateEntry {
  key: string
  loading: boolean
  timestamp: number
  metadata?: Record<string, any>
}

export interface LoadingStateReturn {
  setLoading: (key: string, loading: boolean, metadata?: Record<string, any>) => void
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  getLoadingKeys: () => string[]
  clearLoading: (key: string) => void
  clearAllLoading: () => void
  getLoadingState: (key: string) => LoadingStateEntry | undefined
  getAllLoadingStates: () => LoadingStateEntry[]
}

// Global state for loading states
const globalLoadingStates = reactive(new Map<string, LoadingStateEntry>())

export function useLoadingState(options: LoadingStateOptions = {}): LoadingStateReturn {
  const {
    globalKey = 'default',
    autoCleanup = true,
    maxAge = 30000 // 30 seconds
  } = options

  // Local state for this instance
  const localLoadingStates = ref(new Map<string, LoadingStateEntry>())

  // Choose between global or local state based on globalKey
  const loadingStates = globalKey === 'default' ? globalLoadingStates : localLoadingStates.value

  const setLoading = (key: string, loading: boolean, metadata?: Record<string, any>) => {
    const fullKey = globalKey !== 'default' ? `${globalKey}:${key}` : key
    
    if (loading) {
      loadingStates.set(fullKey, {
        key: fullKey,
        loading: true,
        timestamp: Date.now(),
        metadata
      })
    } else {
      loadingStates.delete(fullKey)
    }

    // Auto-cleanup old entries if enabled
    if (autoCleanup) {
      cleanupOldEntries()
    }
  }

  const isLoading = (key: string): boolean => {
    const fullKey = globalKey !== 'default' ? `${globalKey}:${key}` : key
    const entry = loadingStates.get(fullKey)
    
    if (!entry) return false
    
    // Check if entry is too old
    if (autoCleanup && Date.now() - entry.timestamp > maxAge) {
      loadingStates.delete(fullKey)
      return false
    }
    
    return entry.loading
  }

  const isAnyLoading = (): boolean => {
    if (autoCleanup) {
      cleanupOldEntries()
    }
    
    return loadingStates.size > 0
  }

  const getLoadingKeys = (): string[] => {
    if (autoCleanup) {
      cleanupOldEntries()
    }
    
    return Array.from(loadingStates.keys())
  }

  const clearLoading = (key: string) => {
    const fullKey = globalKey !== 'default' ? `${globalKey}:${key}` : key
    loadingStates.delete(fullKey)
  }

  const clearAllLoading = () => {
    if (globalKey === 'default') {
      globalLoadingStates.clear()
    } else {
      // Only clear entries with this instance's prefix
      const keysToDelete = Array.from(loadingStates.keys())
        .filter(key => key.startsWith(`${globalKey}:`))
      
      keysToDelete.forEach(key => loadingStates.delete(key))
    }
  }

  const getLoadingState = (key: string): LoadingStateEntry | undefined => {
    const fullKey = globalKey !== 'default' ? `${globalKey}:${key}` : key
    return loadingStates.get(fullKey)
  }

  const getAllLoadingStates = (): LoadingStateEntry[] => {
    if (autoCleanup) {
      cleanupOldEntries()
    }
    
    return Array.from(loadingStates.values())
  }

  const cleanupOldEntries = () => {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    loadingStates.forEach((entry, key) => {
      if (now - entry.timestamp > maxAge) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => loadingStates.delete(key))
  }

  // Cleanup on unmount for local instances
  if (process.client && globalKey !== 'default') {
    onBeforeUnmount(() => {
      clearAllLoading()
    })
  }

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingKeys,
    clearLoading,
    clearAllLoading,
    getLoadingState,
    getAllLoadingStates
  }
}

// Convenience composable for global loading state
export function useGlobalLoadingState(): LoadingStateReturn {
  return useLoadingState({ globalKey: 'default' })
}

// Computed property for checking if any global loading is active
export const isGlobalLoading = computed(() => {
  return globalLoadingStates.size > 0
})