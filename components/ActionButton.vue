<template>
  <BaseButton
    :severity="actionSeverity"
    :disabled="disabled"
    :loading="state.loading"
    :aria-label="computedAriaLabel"
    :aria-describedby="ariaDescribedBy"
    :touch-friendly="touchFriendly"
    :show-success-icon="showSuccessIcon"
    :show-error-icon="showErrorIcon"
    :button-state-options="buttonStateOptions"
    @click="handleClick"
    @keydown="handleKeydown"
    @state-change="handleStateChange"
    :class="actionClasses"
    ref="baseButtonRef"
  >
    <template #default>
      <i v-if="actionIcon && !state.loading" :class="actionIcon" class="action-icon"></i>
      <span v-if="showLabel" class="action-label">{{ actionLabel }}</span>
    </template>
  </BaseButton>


</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import type { ButtonStateOptions } from '~/composables/useButtonState'
import { useAccessibility } from '~/composables/useAccessibility'

// Action types enum
export type ActionType = 'view' | 'edit' | 'delete' | 'save' | 'cancel' | 'create' | 'update' | 'copy' | 'download'

// Props Interface
interface ActionButtonProps {
  action: ActionType
  disabled?: boolean
  loading?: boolean
  touchFriendly?: boolean
  showLabel?: boolean
  showIcon?: boolean
  showSuccessIcon?: boolean
  showErrorIcon?: boolean
  customLabel?: string
  customIcon?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  buttonStateOptions?: ButtonStateOptions
  // Confirmation props
  requireConfirmation?: boolean
  confirmationMessage?: string
  confirmationHeader?: string
  confirmationAcceptLabel?: string
  confirmationRejectLabel?: string
  // Data context for confirmation messages
  itemName?: string
  itemType?: string
}

// Props with defaults
const props = withDefaults(defineProps<ActionButtonProps>(), {
  disabled: false,
  loading: false,
  touchFriendly: false,
  showLabel: true,
  showIcon: true,
  showSuccessIcon: true,
  showErrorIcon: true,
  requireConfirmation: undefined, // Auto-determined based on action type
  confirmationAcceptLabel: 'Confirm',
  confirmationRejectLabel: 'Cancel',
  itemType: 'item'
})

// Emits
const emit = defineEmits<{
  click: [event: MouseEvent, action: ActionType]
  keydown: [event: KeyboardEvent, action: ActionType]
  stateChange: [state: { enabled: boolean; loading: boolean; error: string | null; success: boolean }, action: ActionType]
  confirmed: [action: ActionType]
  cancelled: [action: ActionType]
}>()

// Template refs and confirmation service
const baseButtonRef = ref()
const confirm = useConfirm()

// Accessibility management
const { 
  announceStateChange, 
  generateAriaLabel, 
  handleKeyboardNavigation,
  prefersHighContrast,
  prefersReducedMotion
} = useAccessibility({
  announceStateChanges: true,
  respectReducedMotion: true,
  enableKeyboardNavigation: true,
  enableHighContrast: true
})

// Action configuration mapping
const actionConfig = computed(() => {
  const configs = {
    view: {
      icon: 'pi pi-eye',
      label: 'View',
      severity: 'info' as const,
      requiresConfirmation: false,
      confirmationMessage: `View ${props.itemName || props.itemType}?`
    },
    edit: {
      icon: 'pi pi-pencil',
      label: 'Edit',
      severity: 'warning' as const,
      requiresConfirmation: false,
      confirmationMessage: `Edit ${props.itemName || props.itemType}?`
    },
    delete: {
      icon: 'pi pi-trash',
      label: 'Delete',
      severity: 'danger' as const,
      requiresConfirmation: true,
      confirmationMessage: `Are you sure you want to delete ${props.itemName || `this ${props.itemType}`}? This action cannot be undone.`
    },
    save: {
      icon: 'pi pi-check',
      label: 'Save',
      severity: 'success' as const,
      requiresConfirmation: false,
      confirmationMessage: `Save changes to ${props.itemName || props.itemType}?`
    },
    cancel: {
      icon: 'pi pi-times',
      label: 'Cancel',
      severity: 'secondary' as const,
      requiresConfirmation: false,
      confirmationMessage: `Cancel changes to ${props.itemName || props.itemType}?`
    },
    create: {
      icon: 'pi pi-plus',
      label: 'Create',
      severity: 'success' as const,
      requiresConfirmation: false,
      confirmationMessage: `Create new ${props.itemType}?`
    },
    update: {
      icon: 'pi pi-refresh',
      label: 'Update',
      severity: 'primary' as const,
      requiresConfirmation: false,
      confirmationMessage: `Update ${props.itemName || props.itemType}?`
    },
    copy: {
      icon: 'pi pi-copy',
      label: 'Copy',
      severity: 'info' as const,
      requiresConfirmation: false,
      confirmationMessage: `Copy ${props.itemName || props.itemType}?`
    },
    download: {
      icon: 'pi pi-download',
      label: 'Download',
      severity: 'primary' as const,
      requiresConfirmation: false,
      confirmationMessage: `Download ${props.itemName || props.itemType}?`
    }
  }
  
  return configs[props.action]
})

// Computed properties
const actionIcon = computed(() => {
  if (!props.showIcon) return null
  return props.customIcon || actionConfig.value.icon
})

const actionLabel = computed(() => {
  return props.customLabel || actionConfig.value.label
})

const actionSeverity = computed(() => {
  return actionConfig.value.severity
})

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  
  const baseLabel = `${actionLabel.value} ${props.itemName || props.itemType}`
  
  if (state.value.loading) return `${baseLabel} - Loading`
  if (state.value.error) return `${baseLabel} - Error: ${state.value.error}`
  if (state.value.success) return `${baseLabel} - Success`
  
  return baseLabel
})

const confirmationRequired = computed(() => {
  return props.requireConfirmation ?? actionConfig.value.requiresConfirmation
})

const confirmationMessage = computed(() => {
  return props.confirmationMessage || actionConfig.value.confirmationMessage
})

const confirmationHeader = computed(() => {
  return props.confirmationHeader || `Confirm ${actionLabel.value}`
})

const confirmationSeverity = computed(() => {
  return actionConfig.value.severity === 'danger' ? 'danger' : 'info'
})

const confirmationAcceptLabel = computed(() => {
  return props.confirmationAcceptLabel
})

const confirmationRejectLabel = computed(() => {
  return props.confirmationRejectLabel
})

const actionClasses = computed(() => [
  'action-button',
  `action-button--${props.action}`,
  {
    'action-button--icon-only': !props.showLabel && props.showIcon,
    'action-button--label-only': props.showLabel && !props.showIcon,
    'action-button--confirmation-required': confirmationRequired.value
  }
])

// Access the state from BaseButton
const state = computed(() => {
  return baseButtonRef.value?.state || {
    enabled: true,
    loading: false,
    error: null,
    success: false
  }
})

// Watch for state changes and announce them to screen readers
watch(() => state.value.loading, (newLoading, oldLoading) => {
  if (newLoading !== oldLoading && newLoading) {
    const context = `${actionLabel.value} ${props.itemName || props.itemType}`
    announceStateChange('Loading', context)
  }
})

watch(() => state.value.error, (newError, oldError) => {
  if (newError !== oldError && newError) {
    const context = `${actionLabel.value} ${props.itemName || props.itemType}`
    announceStateChange(`Error: ${newError}`, context)
  }
})

watch(() => state.value.success, (newSuccess, oldSuccess) => {
  if (newSuccess !== oldSuccess && newSuccess) {
    const context = `${actionLabel.value} ${props.itemName || props.itemType}`
    announceStateChange('Completed successfully', context)
  }
})

// Methods
const handleClick = async (event: MouseEvent) => {
  if (confirmationRequired.value) {
    // Show confirmation dialog using PrimeVue's confirm service
    confirm.require({
      message: confirmationMessage.value,
      header: confirmationHeader.value,
      acceptLabel: confirmationAcceptLabel.value,
      rejectLabel: confirmationRejectLabel.value,
      severity: confirmationSeverity.value,
      accept: () => {
        emit('confirmed', props.action)
        emit('click', event, props.action)
      },
      reject: () => {
        emit('cancelled', props.action)
      }
    })
    return
  }
  
  // Emit the click event with action type
  emit('click', event, props.action)
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle Enter and Space for confirmation dialogs
  if (confirmationRequired.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    // Trigger the same confirmation flow as click
    const syntheticEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
    handleClick(syntheticEvent)
    return
  }
  
  emit('keydown', event, props.action)
}

const handleStateChange = (newState: any) => {
  emit('stateChange', newState, props.action)
}

// Expose methods for parent components
const executeAction = async (action: () => Promise<void>) => {
  return baseButtonRef.value?.execute(action)
}

const resetState = () => {
  baseButtonRef.value?.reset()
}

const retryAction = async () => {
  return baseButtonRef.value?.retry()
}

const setEnabled = (enabled: boolean) => {
  baseButtonRef.value?.setEnabled(enabled)
}

// Expose reactive state and methods
defineExpose({
  state,
  execute: executeAction,
  reset: resetState,
  retry: retryAction,
  setEnabled,
  action: props.action,
  actionConfig: actionConfig.value
})
</script>

<style scoped>
.action-button {
  @apply inline-flex items-center justify-center;
  gap: 0.5rem;
}

/* Action-specific styling */
.action-button--view:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.action-button--edit:hover {
  background-color: rgba(245, 158, 11, 0.1);
}

.action-button--delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.action-button--save:hover {
  background-color: rgba(34, 197, 94, 0.1);
}

.action-button--cancel:hover {
  background-color: rgba(107, 114, 128, 0.1);
}

.action-button--create:hover {
  background-color: rgba(34, 197, 94, 0.1);
}

.action-button--update:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.action-button--copy:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.action-button--download:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Icon and label spacing */
.action-icon {
  flex-shrink: 0;
}

.action-label {
  white-space: nowrap;
}

/* Icon-only button styling */
.action-button--icon-only {
  min-width: 2.5rem;
  min-height: 2.5rem;
  padding: 0.5rem;
}

.action-button--icon-only .action-icon {
  font-size: 1rem;
}

/* Label-only button styling */
.action-button--label-only {
  padding: 0.5rem 1rem;
}

/* Confirmation required indicator */
.action-button--confirmation-required {
  position: relative;
}

.action-button--confirmation-required::after {
  content: '';
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  background-color: #ef4444;
  border-radius: 50%;
  opacity: 0.6;
}

/* Touch-friendly enhancements */
@media (max-width: 768px) {
  .action-button--icon-only {
    min-width: 3rem;
    min-height: 3rem;
    padding: 0.75rem;
  }
  
  .action-button--icon-only .action-icon {
    font-size: 1.125rem;
  }
  
  .action-button {
    gap: 0.75rem;
    padding: 0.75rem 1rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .action-button--confirmation-required::after {
    opacity: 1;
    border: 1px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .action-button {
    transition: none;
  }
}

/* Focus states for better accessibility */
.action-button:focus-visible {
  outline: 2px solid;
  outline-offset: 2px;
}

.action-button--view:focus-visible {
  outline-color: #3b82f6;
}

.action-button--edit:focus-visible {
  outline-color: #f59e0b;
}

.action-button--delete:focus-visible {
  outline-color: #ef4444;
}

.action-button--save:focus-visible {
  outline-color: #22c55e;
}

.action-button--cancel:focus-visible {
  outline-color: #6b7280;
}

.action-button--create:focus-visible {
  outline-color: #22c55e;
}

.action-button--update:focus-visible {
  outline-color: #3b82f6;
}

.action-button--copy:focus-visible {
  outline-color: #3b82f6;
}

.action-button--download:focus-visible {
  outline-color: #3b82f6;
}
</style>