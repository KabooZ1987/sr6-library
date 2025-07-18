<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-state">
      <div class="error-content">
        <div class="error-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h3 class="error-title">{{ errorTitle }}</h3>
        <p class="error-message">{{ errorMessage }}</p>
        <div v-if="showDetails && errorDetails" class="error-details">
          <Button
            :label="showErrorDetails ? 'Hide Details' : 'Show Details'"
            icon="pi pi-chevron-down"
            :iconPos="showErrorDetails ? 'right' : 'right'"
            text
            size="small"
            @click="toggleErrorDetails"
            class="error-details-toggle"
          />
          <div v-if="showErrorDetails" class="error-details-content">
            <pre>{{ errorDetails }}</pre>
          </div>
        </div>
        <div class="error-actions">
          <Button
            label="Try Again"
            icon="pi pi-refresh"
            @click="retry"
            class="retry-btn"
            :class="{ 'touch-friendly': isMobile }"
          />
          <Button
            v-if="showReportButton"
            label="Report Issue"
            icon="pi pi-send"
            severity="secondary"
            outlined
            @click="reportError"
            class="report-btn"
            :class="{ 'touch-friendly': isMobile }"
          />
        </div>
      </div>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onErrorCaptured } from 'vue'

interface Props {
  fallbackTitle?: string
  fallbackMessage?: string
  showDetails?: boolean
  showReportButton?: boolean
  onError?: (error: Error, errorInfo: any) => void
  onRetry?: () => void
  onReport?: (error: Error, errorInfo: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: 'Something went wrong',
  fallbackMessage: 'An unexpected error occurred. Please try again.',
  showDetails: false,
  showReportButton: false
})

const emit = defineEmits<{
  error: [error: Error, errorInfo: any]
  retry: []
  report: [error: Error, errorInfo: any]
}>()

const hasError = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref('')
const showErrorDetails = ref(false)
const isMobile = ref(false)
const capturedError = ref<Error | null>(null)
const capturedErrorInfo = ref<any>(null)

function handleError(error: Error, errorInfo: any) {
  hasError.value = true
  capturedError.value = error
  capturedErrorInfo.value = errorInfo
  
  // Set user-friendly error messages
  errorTitle.value = getErrorTitle(error)
  errorMessage.value = getErrorMessage(error)
  errorDetails.value = getErrorDetails(error, errorInfo)
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error, errorInfo)
  }
  
  // Emit error event
  emit('error', error, errorInfo)
  
  // Log error for debugging
  console.error('Error caught by ErrorBoundary:', error, errorInfo)
}

function getErrorTitle(error: Error): string {
  if (error.name === 'ChunkLoadError') {
    return 'Loading Error'
  }
  if (error.name === 'NetworkError') {
    return 'Network Error'
  }
  if (error.message?.includes('fetch')) {
    return 'Connection Error'
  }
  return props.fallbackTitle
}

function getErrorMessage(error: Error): string {
  if (error.name === 'ChunkLoadError') {
    return 'Failed to load application resources. Please refresh the page.'
  }
  if (error.name === 'NetworkError') {
    return 'Unable to connect to the server. Please check your internet connection.'
  }
  if (error.message?.includes('fetch')) {
    return 'Failed to load data. Please check your connection and try again.'
  }
  if (error.message?.includes('timeout')) {
    return 'The request timed out. Please try again.'
  }
  return props.fallbackMessage
}

function getErrorDetails(error: Error, errorInfo: any): string {
  const details = []
  
  if (error.name) {
    details.push(`Error Type: ${error.name}`)
  }
  
  if (error.message) {
    details.push(`Message: ${error.message}`)
  }
  
  if (error.stack) {
    details.push(`Stack Trace:\n${error.stack}`)
  }
  
  if (errorInfo && typeof errorInfo === 'object') {
    details.push(`Error Info: ${JSON.stringify(errorInfo, null, 2)}`)
  }
  
  return details.join('\n\n')
}

function retry() {
  hasError.value = false
  capturedError.value = null
  capturedErrorInfo.value = null
  errorDetails.value = ''
  showErrorDetails.value = false
  
  if (props.onRetry) {
    props.onRetry()
  }
  
  emit('retry')
}

function reportError() {
  if (capturedError.value && capturedErrorInfo.value) {
    if (props.onReport) {
      props.onReport(capturedError.value, capturedErrorInfo.value)
    }
    
    emit('report', capturedError.value, capturedErrorInfo.value)
  }
}

function toggleErrorDetails() {
  showErrorDetails.value = !showErrorDetails.value
}

function updateScreenSize() {
  isMobile.value = window.innerWidth <= 768
}

// Error capture
onErrorCaptured((error: Error, instance: any, info: string) => {
  handleError(error, { instance, info })
  return false // Prevent the error from propagating further
})

// Global error handling
function handleGlobalError(event: ErrorEvent) {
  const error = event.error || new Error(event.message)
  handleError(error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  handleError(error, { type: 'unhandledRejection' })
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
}

.error-content {
  max-width: 500px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.error-icon i {
  font-size: 2rem;
}

.error-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.error-message {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color-secondary);
}

.error-details {
  width: 100%;
  max-width: 600px;
}

.error-details-toggle {
  margin-bottom: 1rem;
}

.error-details-content {
  background: var(--surface-50);
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
}

.error-details-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-color);
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.report-btn {
  min-width: 8rem;
  padding: 0.75rem 1.5rem;
}

.retry-btn.touch-friendly,
.report-btn.touch-friendly {
  min-height: 2.75rem;
  min-width: 9rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .error-state {
    padding: 1rem;
    min-height: 250px;
  }
  
  .error-content {
    gap: 1rem;
  }
  
  .error-icon {
    width: 3rem;
    height: 3rem;
  }
  
  .error-icon i {
    font-size: 1.5rem;
  }
  
  .error-title {
    font-size: 1.25rem;
  }
  
  .error-message {
    font-size: 0.95rem;
  }
  
  .error-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  
  .retry-btn,
  .report-btn {
    width: 100%;
    min-height: 2.75rem;
    font-size: 1rem;
  }
  
  .error-details-content {
    padding: 0.75rem;
    max-height: 150px;
  }
  
  .error-details-content pre {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .error-state {
    padding: 0.75rem;
    min-height: 200px;
  }
  
  .error-content {
    gap: 0.75rem;
  }
  
  .error-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .error-icon i {
    font-size: 1.25rem;
  }
  
  .error-title {
    font-size: 1.125rem;
  }
  
  .error-message {
    font-size: 0.9rem;
  }
  
  .error-details-content {
    padding: 0.5rem;
    max-height: 120px;
  }
  
  .error-details-content pre {
    font-size: 0.65rem;
  }
}

/* Focus states for accessibility */
.retry-btn:focus-visible,
.report-btn:focus-visible,
.error-details-toggle:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Scrollbar styling for error details */
.error-details-content::-webkit-scrollbar {
  width: 6px;
}

.error-details-content::-webkit-scrollbar-track {
  background: var(--surface-100);
  border-radius: 3px;
}

.error-details-content::-webkit-scrollbar-thumb {
  background: var(--surface-300);
  border-radius: 3px;
}

.error-details-content::-webkit-scrollbar-thumb:hover {
  background: var(--surface-400);
}

/* Animation for error state appearance */
.error-state {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading animation for retry button */
.retry-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.retry-btn:disabled i {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>