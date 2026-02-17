import { reactive, computed, onBeforeUnmount, type ComputedRef } from 'vue'
import { useErrorService } from '~/services/errorService'

export interface ButtonStateOptions {
  initialEnabled?: boolean
  successDuration?: number
  errorDuration?: number
  retryAttempts?: number
  retryDelay?: number
  component?: string
  action?: string
  enableErrorService?: boolean
}

export interface ButtonState {
  enabled: boolean
  loading: boolean
  error: string | null
  success: boolean
  retryCount: number
}

export interface ButtonStateReturn {
  state: ButtonState
  execute: (action: () => Promise<void>) => Promise<void>
  reset: () => void
  setEnabled: (enabled: boolean) => void
  retry: () => Promise<void>
  computedDisabled: ComputedRef<boolean>
}

export function useButtonState(options: ButtonStateOptions = {}): ButtonStateReturn {
  const {
    initialEnabled = true,
    successDuration = 2000,
    errorDuration = 5000,
    retryAttempts = 3,
    retryDelay = 1000,
    component = 'unknown',
    action = 'unknown',
    enableErrorService = true
  } = options

  const errorService = enableErrorService ? useErrorService() : null

  const state = reactive<ButtonState>({
    enabled: initialEnabled,
    loading: false,
    error: null,
    success: false,
    retryCount: 0
  })

  let currentAction: (() => Promise<void>) | null = null
  let successTimeout: NodeJS.Timeout | null = null
  let errorTimeout: NodeJS.Timeout | null = null

  const computedDisabled = computed(() => !state.enabled || state.loading)

  const clearTimeouts = () => {
    if (successTimeout) {
      clearTimeout(successTimeout)
      successTimeout = null
    }
    if (errorTimeout) {
      clearTimeout(errorTimeout)
      errorTimeout = null
    }
  }

  const reset = () => {
    clearTimeouts()
    state.loading = false
    state.error = null
    state.success = false
    state.retryCount = 0
    currentAction = null
  }

  const setEnabled = (enabled: boolean) => {
    state.enabled = enabled
  }

  const executeWithRetry = async (action: () => Promise<void>, attempt: number = 0): Promise<void> => {
    state.loading = true
    state.error = null
    state.success = false

    try {
      await action()
      
      // Success state
      state.success = true
      state.retryCount = 0
      
      // Auto-clear success state after duration
      successTimeout = setTimeout(() => {
        state.success = false
      }, successDuration)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      
      // Check if we should retry
      if (attempt < retryAttempts) {
        state.retryCount = attempt + 1
        
        // Wait before retry with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        return executeWithRetry(action, attempt + 1)
      } else {
        // Max retries reached, show error
        state.error = errorMessage
        state.retryCount = 0
        
        // Auto-clear error state after duration
        errorTimeout = setTimeout(() => {
          state.error = null
        }, errorDuration)
        
        throw error
      }
    } finally {
      state.loading = false
    }
  }

  const execute = async (action: () => Promise<void>): Promise<void> => {
    if (computedDisabled.value) {
      return
    }

    currentAction = action
    clearTimeouts()
    
    if (errorService) {
      // Use error service for enhanced error handling and retry logic
      state.loading = true
      state.error = null
      state.success = false
      
      try {
        await errorService.executeWithRetry(
          action,
          { component, action: action.name || 'button-action' },
          {
            maxAttempts: retryAttempts,
            baseDelay: retryDelay,
            retryCondition: errorService.shouldRetry
          }
        )
        
        // Success state
        state.success = true
        state.retryCount = 0
        
        // Auto-clear success state after duration
        successTimeout = setTimeout(() => {
          state.success = false
        }, successDuration)
        
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        
        // Get user-friendly error message
        state.error = errorService.getUserFriendlyMessage(err)
        state.retryCount = 0
        
        // Auto-clear error state after duration
        errorTimeout = setTimeout(() => {
          state.error = null
        }, errorDuration)
        
        throw error
      } finally {
        state.loading = false
      }
    } else {
      // Fallback to original retry logic
      return executeWithRetry(action)
    }
  }

  const retry = async (): Promise<void> => {
    if (!currentAction) {
      throw new Error('No action to retry')
    }
    
    return execute(currentAction)
  }

  // Cleanup on unmount
  if (process.client) {
    onBeforeUnmount(() => {
      clearTimeouts()
    })
  }

  return {
    state,
    execute,
    reset,
    setEnabled,
    retry,
    computedDisabled
  }
}