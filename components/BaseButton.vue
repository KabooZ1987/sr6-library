<template>
  <Button
    :disabled="computedDisabled"
    :loading="state.loading"
    :severity="computedSeverity"
    :class="buttonClasses"
    :size="computedSize"
    v-bind="$attrs"
    @click="handleClick"
    @keydown="handleKeydown"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedBy"
    :aria-busy="state.loading"
    ref="buttonRef"
  >
    <template #default>
      <span v-if="state.success && showSuccessIcon" class="success-icon">
        <i class="pi pi-check"></i>
      </span>
      <span v-else-if="state.error && showErrorIcon" class="error-icon">
        <i class="pi pi-exclamation-triangle"></i>
      </span>
      <slot v-else />
    </template>
  </Button>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { useButtonState, type ButtonStateOptions } from '~/composables/useButtonState'
import { useAccessibility } from '~/composables/useAccessibility'

// Props Interface
interface BaseButtonProps {
  disabled?: boolean
  loading?: boolean
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help' | 'contrast'
  size?: 'small' | 'normal' | 'large'
  touchFriendly?: boolean
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  ariaLabel?: string
  ariaDescribedBy?: string
  buttonStateOptions?: ButtonStateOptions
}

// Props with defaults
const props = withDefaults(defineProps<BaseButtonProps>(), {
  disabled: false,
  loading: false,
  severity: 'primary',
  size: 'normal',
  touchFriendly: false,
  showSuccessIcon: true,
  showErrorIcon: true
})

// Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
  keydown: [event: KeyboardEvent]
  stateChange: [state: { enabled: boolean; loading: boolean; error: string | null; success: boolean }]
}>()

// Button state management
const { state, execute, reset, setEnabled, retry, computedDisabled } = useButtonState(props.buttonStateOptions)

// Accessibility management
const { 
  announceStateChange, 
  generateAriaLabel, 
  prefersReducedMotion,
  prefersHighContrast,
  handleKeyboardNavigation
} = useAccessibility({
  announceStateChanges: true,
  respectReducedMotion: true,
  enableKeyboardNavigation: true,
  enableHighContrast: true
})

// Template ref
const buttonRef = ref<HTMLElement>()

// Computed properties
const computedSeverity = computed(() => {
  if (state.error) return 'danger'
  if (state.success) return 'success'
  return props.severity
})

const computedSize = computed(() => {
  // Make buttons touch-friendly on mobile when touchFriendly is true
  if (props.touchFriendly && process.client) {
    const isMobile = window.innerWidth <= 768
    if (isMobile && props.size === 'normal') return 'large'
  }
  return props.size
})

// Enhanced ARIA label with state information
const ariaLabel = computed(() => {
  if (props.ariaLabel) {
    return generateAriaLabel(props.ariaLabel, {
      loading: state.loading,
      error: state.error,
      success: state.success,
      disabled: computedDisabled.value
    })
  }
  return undefined
})

const buttonClasses = computed(() => {
  const classes = [
    'base-button',
    {
      'base-button--loading': state.loading,
      'base-button--error': state.error,
      'base-button--success': state.success,
      'base-button--disabled': computedDisabled.value,
      'base-button--touch-friendly': props.touchFriendly,
      'base-button--reduced-motion': prefersReducedMotion(),
      'base-button--high-contrast': prefersHighContrast(),
      [`base-button--${props.size}`]: true,
      [`base-button--${computedSeverity.value}`]: true
    }
  ]
  
  return classes
})

// Watch for external disabled prop changes
const setDisabled = (disabled: boolean) => {
  setEnabled(!disabled)
}

// Watch props.disabled and sync with internal state
if (props.disabled !== undefined) {
  setDisabled(props.disabled)
}

// Watch for state changes and announce them to screen readers
watch(() => state.loading, (newLoading, oldLoading) => {
  if (newLoading !== oldLoading && props.ariaLabel) {
    const context = props.ariaLabel
    if (newLoading) {
      announceStateChange('Loading', context)
    }
  }
})

watch(() => state.error, (newError, oldError) => {
  if (newError !== oldError && newError && props.ariaLabel) {
    const context = props.ariaLabel
    announceStateChange(`Error: ${newError}`, context)
  }
})

watch(() => state.success, (newSuccess, oldSuccess) => {
  if (newSuccess !== oldSuccess && newSuccess && props.ariaLabel) {
    const context = props.ariaLabel
    announceStateChange('Completed successfully', context)
  }
})

// Methods
const handleClick = async (event: MouseEvent) => {
  if (computedDisabled.value) {
    event.preventDefault()
    return
  }

  emit('click', event)
  
  // Emit state change for external monitoring
  emit('stateChange', {
    enabled: state.enabled,
    loading: state.loading,
    error: state.error,
    success: state.success
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Enter and Space key activation
  if (event.key === 'Enter' || event.key === ' ') {
    if (!computedDisabled.value) {
      event.preventDefault()
      // Trigger click event
      nextTick(() => {
        buttonRef.value?.click()
      })
    }
  }
  
  emit('keydown', event)
}

// Expose methods for parent components
const executeAction = async (action: () => Promise<void>) => {
  return execute(action)
}

const resetState = () => {
  reset()
}

const retryAction = async () => {
  return retry()
}

// Expose reactive state and methods
defineExpose({
  state,
  execute: executeAction,
  reset: resetState,
  retry: retryAction,
  setEnabled,
  computedDisabled
})
</script>

<style scoped>
.base-button {
  transition: all 0.2s ease-in-out;
}

.base-button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Size variants */
.base-button--small {
  font-size: 0.75rem;
}

.base-button--normal {
  font-size: 0.875rem;
}

.base-button--large {
  font-size: 1rem;
}

/* Touch-friendly enhancements */
.base-button--touch-friendly {
  min-height: 2.75rem;
  min-width: 2.75rem;
}

.base-button--touch-friendly.base-button--small {
  min-height: 2.5rem;
  min-width: 2.5rem;
}

.base-button--touch-friendly.base-button--large {
  min-height: 3rem;
  min-width: 3rem;
}

/* State-specific styles */
.base-button--loading {
  cursor: wait;
}

.base-button--error {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.base-button--success .success-icon {
  color: #16a34a;
  animation: bounce 1s infinite;
}

.base-button--error .error-icon {
  color: #dc2626;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.base-button--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Hover states - only apply when not disabled or loading */
.base-button:hover:not(.base-button--disabled):not(.base-button--loading) {
  transform: scale(1.05);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.base-button:active:not(.base-button--disabled):not(.base-button--loading) {
  transform: scale(0.95);
}

/* Severity-specific hover states */
.base-button--primary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.base-button--secondary:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #4b5563;
  border-color: #4b5563;
}

.base-button--success:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #16a34a;
  border-color: #16a34a;
}

.base-button--info:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #0891b2;
  border-color: #0891b2;
}

.base-button--warning:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #d97706;
  border-color: #d97706;
}

.base-button--danger:hover:not(.base-button--disabled):not(.base-button--loading) {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* Focus states for accessibility */
.base-button--primary:focus-visible {
  outline-color: #3b82f6;
}

.base-button--secondary:focus-visible {
  outline-color: #6b7280;
}

.base-button--success:focus-visible {
  outline-color: #22c55e;
}

.base-button--info:focus-visible {
  outline-color: #06b6d4;
}

.base-button--warning:focus-visible {
  outline-color: #f59e0b;
}

.base-button--danger:focus-visible {
  outline-color: #ef4444;
}

/* Mobile-specific enhancements */
@media (max-width: 768px) {
  .base-button--touch-friendly {
    min-height: 3rem;
    min-width: 3rem;
    font-size: 1rem;
  }
  
  .base-button--touch-friendly:active {
    transform: scale(0.95);
    background-color: rgba(0, 0, 0, 0.8);
    transition: all 0.1s ease;
  }
  
  /* Improve touch feedback */
  .base-button:active:not(.base-button--disabled):not(.base-button--loading) {
    background-color: rgba(0, 0, 0, 0.8);
    transition: all 0.1s ease;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .base-button {
    border: 2px solid;
  }
  
  .base-button--disabled {
    opacity: 0.6;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .base-button {
    transition: none;
  }
  
  .base-button--error {
    animation: none;
  }
  
  .base-button--success .success-icon {
    animation: none;
  }
  
  .base-button--error .error-icon {
    animation: none;
  }
  
  .base-button:hover:not(.base-button--disabled):not(.base-button--loading) {
    transform: none;
  }
  
  .base-button:active:not(.base-button--disabled):not(.base-button--loading) {
    transform: none;
  }
}

/* Icon spacing */
.success-icon,
.error-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.success-icon i,
.error-icon i {
  font-size: 0.875rem;
}

/* Loading state enhancements */
.base-button--loading {
  position: relative;
}

/* Ensure proper spacing for icons and text */
.base-button :deep(.p-button-label) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* PrimeVue Button overrides for consistency */
.base-button :deep(.p-button) {
  transition: all 0.2s;
}

.base-button :deep(.p-button:focus) {
  outline: none;
}

/* Ensure loading spinner is properly sized */
.base-button :deep(.p-button-loading-icon) {
  width: 1rem;
  height: 1rem;
}

.base-button--large :deep(.p-button-loading-icon) {
  width: 1.25rem;
  height: 1.25rem;
}

.base-button--small :deep(.p-button-loading-icon) {
  width: 0.75rem;
  height: 0.75rem;
}
</style>