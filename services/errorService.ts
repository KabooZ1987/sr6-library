import { ref, reactive } from 'vue'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp: number
  userAgent: string
  url: string
  metadata?: Record<string, any>
}

export interface ErrorEntry {
  id: string
  error: Error
  context: ErrorContext
  severity: 'low' | 'medium' | 'high' | 'critical'
  retryCount: number
  resolved: boolean
  reportedToUser: boolean
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition?: (error: Error) => boolean
}

export interface ErrorServiceOptions {
  enableLogging?: boolean
  enableReporting?: boolean
  maxErrorHistory?: number
  defaultRetryConfig?: Partial<RetryConfig>
}

class ErrorService {
  private errors = reactive(new Map<string, ErrorEntry>())
  private errorHistory = ref<ErrorEntry[]>([])
  private options: Required<ErrorServiceOptions>
  private errorIdCounter = 0

  constructor(options: ErrorServiceOptions = {}) {
    this.options = {
      enableLogging: true,
      enableReporting: false,
      maxErrorHistory: 100,
      defaultRetryConfig: {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2
      },
      ...options
    }
  }

  /**
   * Capture and process an error
   */
  captureError(
    error: Error,
    context: Partial<ErrorContext> = {},
    severity: ErrorEntry['severity'] = 'medium'
  ): string {
    const errorId = this.generateErrorId()
    
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...context
    }

    const errorEntry: ErrorEntry = {
      id: errorId,
      error,
      context: fullContext,
      severity,
      retryCount: 0,
      resolved: false,
      reportedToUser: false
    }

    // Store error
    this.errors.set(errorId, errorEntry)
    this.errorHistory.value.unshift(errorEntry)

    // Maintain history size limit
    if (this.errorHistory.value.length > this.options.maxErrorHistory) {
      this.errorHistory.value = this.errorHistory.value.slice(0, this.options.maxErrorHistory)
    }

    // Log error if enabled
    if (this.options.enableLogging) {
      this.logError(errorEntry)
    }

    return errorId
  }

  /**
   * Execute an action with automatic retry logic
   */
  async executeWithRetry<T>(
    action: () => Promise<T>,
    context: Partial<ErrorContext> = {},
    retryConfig: Partial<RetryConfig> = {}
  ): Promise<T> {
    const config: RetryConfig = {
      ...this.options.defaultRetryConfig,
      ...retryConfig
    }

    let lastError: Error
    let attempt = 0

    while (attempt <= config.maxAttempts) {
      try {
        const result = await action()
        
        // If we had previous failures but now succeeded, mark as resolved
        if (attempt > 0 && lastError!) {
          const errorId = this.captureError(lastError!, context, 'low')
          this.markResolved(errorId)
        }
        
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        attempt++

        // Check if we should retry this error
        if (config.retryCondition && !config.retryCondition(lastError)) {
          break
        }

        // If we've exhausted retries, capture the error
        if (attempt > config.maxAttempts) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        )

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000

        await this.sleep(jitteredDelay)
      }
    }

    // All retries failed, capture the final error
    const errorId = this.captureError(lastError!, {
      ...context,
      retryAttempts: attempt - 1
    }, 'high')

    const errorEntry = this.errors.get(errorId)!
    errorEntry.retryCount = attempt - 1

    throw lastError!
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: Error): string {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'The request took too long to complete. Please try again.'
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return 'Please check your input and try again.'
    }

    // Permission errors
    if (error.name === 'PermissionError' || error.message.includes('permission')) {
      return 'You do not have permission to perform this action.'
    }

    // Chunk loading errors (common in SPAs)
    if (error.name === 'ChunkLoadError') {
      return 'Failed to load application resources. Please refresh the page.'
    }

    // Generic fallback
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }

  /**
   * Get recovery suggestions for an error
   */
  getRecoverySuggestions(error: Error): string[] {
    const suggestions: string[] = []

    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      suggestions.push('Check your internet connection')
      suggestions.push('Try refreshing the page')
      suggestions.push('Wait a moment and try again')
    }

    if (error.message.includes('timeout')) {
      suggestions.push('Try again with a slower connection')
      suggestions.push('Check if the server is responding')
    }

    if (error.name === 'ChunkLoadError') {
      suggestions.push('Refresh the page to reload resources')
      suggestions.push('Clear your browser cache')
    }

    if (error.name === 'ValidationError') {
      suggestions.push('Review your input for errors')
      suggestions.push('Check required fields')
    }

    // Always include generic suggestions
    suggestions.push('Contact support if the problem continues')

    return suggestions
  }

  /**
   * Check if an error should be retried
   */
  shouldRetry(error: Error): boolean {
    // Don't retry validation errors
    if (error.name === 'ValidationError') {
      return false
    }

    // Don't retry permission errors
    if (error.name === 'PermissionError') {
      return false
    }

    // Don't retry 4xx client errors (except 408, 429)
    if (error.message.includes('400') || 
        error.message.includes('401') || 
        error.message.includes('403') || 
        error.message.includes('404')) {
      return false
    }

    // Retry network errors, timeouts, and 5xx server errors
    return true
  }

  /**
   * Mark an error as resolved
   */
  markResolved(errorId: string): void {
    const error = this.errors.get(errorId)
    if (error) {
      error.resolved = true
    }
  }

  /**
   * Mark an error as reported to user
   */
  markReportedToUser(errorId: string): void {
    const error = this.errors.get(errorId)
    if (error) {
      error.reportedToUser = true
    }
  }

  /**
   * Get error by ID
   */
  getError(errorId: string): ErrorEntry | undefined {
    return this.errors.get(errorId)
  }

  /**
   * Get all active errors
   */
  getActiveErrors(): ErrorEntry[] {
    return Array.from(this.errors.values()).filter(error => !error.resolved)
  }

  /**
   * Get error history
   */
  getErrorHistory(): ErrorEntry[] {
    return this.errorHistory.value
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): void {
    const activeErrors = new Map<string, ErrorEntry>()
    
    this.errors.forEach((error, id) => {
      if (!error.resolved) {
        activeErrors.set(id, error)
      }
    })
    
    this.errors.clear()
    activeErrors.forEach((error, id) => {
      this.errors.set(id, error)
    })
  }

  /**
   * Clear all errors
   */
  clearAllErrors(): void {
    this.errors.clear()
    this.errorHistory.value = []
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${++this.errorIdCounter}`
  }

  private logError(errorEntry: ErrorEntry): void {
    const logLevel = this.getLogLevel(errorEntry.severity)
    const logMessage = `[${errorEntry.severity.toUpperCase()}] ${errorEntry.error.name}: ${errorEntry.error.message}`
    
    console[logLevel](logMessage, {
      errorId: errorEntry.id,
      context: errorEntry.context,
      stack: errorEntry.error.stack
    })
  }

  private getLogLevel(severity: ErrorEntry['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low': return 'log'
      case 'medium': return 'warn'
      case 'high':
      case 'critical': return 'error'
      default: return 'warn'
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Create singleton instance
export const errorService = new ErrorService()

// Composable for using error service in components
export function useErrorService() {
  return {
    captureError: errorService.captureError.bind(errorService),
    executeWithRetry: errorService.executeWithRetry.bind(errorService),
    getUserFriendlyMessage: errorService.getUserFriendlyMessage.bind(errorService),
    getRecoverySuggestions: errorService.getRecoverySuggestions.bind(errorService),
    shouldRetry: errorService.shouldRetry.bind(errorService),
    markResolved: errorService.markResolved.bind(errorService),
    getError: errorService.getError.bind(errorService),
    getActiveErrors: errorService.getActiveErrors.bind(errorService),
    getErrorHistory: errorService.getErrorHistory.bind(errorService),
    clearResolvedErrors: errorService.clearResolvedErrors.bind(errorService),
    clearAllErrors: errorService.clearAllErrors.bind(errorService)
  }
}