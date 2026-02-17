<template>
  <div class="quick-action-buttons" :class="containerClasses">
    <!-- Desktop: Full buttons with text -->
    <template v-if="screenSize === 'desktop'">
      <BaseButton
        icon="pi pi-eye"
        label="View"
        severity="info"
        text
        size="small"
        :disabled="disabled || loadingStates.view"
        :loading="loadingStates.view"
        @click="handleView"
        v-tooltip.top="'View Details'"
        class="action-btn view-btn"
        :aria-label="`View details for ${itemLabel}`"
        :button-state-options="{ successDuration: 1000 }"
        ref="viewButtonRef"
      />
      <BaseButton
        icon="pi pi-pencil"
        label="Edit"
        severity="warning"
        text
        size="small"
        :disabled="disabled || loadingStates.edit"
        :loading="loadingStates.edit"
        @click="handleEdit"
        v-tooltip.top="'Edit'"
        class="action-btn edit-btn"
        :aria-label="`Edit ${itemLabel}`"
        :button-state-options="{ successDuration: 1000 }"
        ref="editButtonRef"
      />
      <BaseButton
        icon="pi pi-trash"
        label="Delete"
        severity="danger"
        text
        size="small"
        :disabled="disabled || loadingStates.delete"
        :loading="loadingStates.delete"
        @click="handleDelete"
        v-tooltip.top="'Delete'"
        class="action-btn delete-btn"
        :aria-label="`Delete ${itemLabel}`"
        :button-state-options="{ successDuration: 1000, errorDuration: 3000 }"
        ref="deleteButtonRef"
      />
    </template>

    <!-- Tablet: Icons only with tooltips -->
    <template v-else-if="screenSize === 'tablet'">
      <BaseButton
        icon="pi pi-eye"
        severity="info"
        text
        rounded
        size="small"
        :disabled="disabled || loadingStates.view"
        :loading="loadingStates.view"
        @click="handleView"
        v-tooltip.top="'View Details'"
        class="action-btn view-btn icon-only"
        :aria-label="`View details for ${itemLabel}`"
        :button-state-options="{ successDuration: 1000 }"
        ref="viewButtonRef"
      />
      <BaseButton
        icon="pi pi-pencil"
        severity="warning"
        text
        rounded
        size="small"
        :disabled="disabled || loadingStates.edit"
        :loading="loadingStates.edit"
        @click="handleEdit"
        v-tooltip.top="'Edit'"
        class="action-btn edit-btn icon-only"
        :aria-label="`Edit ${itemLabel}`"
        :button-state-options="{ successDuration: 1000 }"
        ref="editButtonRef"
      />
      <BaseButton
        icon="pi pi-trash"
        severity="danger"
        text
        rounded
        size="small"
        :disabled="disabled || loadingStates.delete"
        :loading="loadingStates.delete"
        @click="handleDelete"
        v-tooltip.top="'Delete'"
        class="action-btn delete-btn icon-only"
        :aria-label="`Delete ${itemLabel}`"
        :button-state-options="{ successDuration: 1000, errorDuration: 3000 }"
        ref="deleteButtonRef"
      />
    </template>

    <!-- Mobile: Dropdown menu -->
    <template v-else>
      <BaseButton
        icon="pi pi-ellipsis-v"
        severity="secondary"
        text
        rounded
        :size="screenSize === 'mobile-xs' ? 'normal' : 'small'"
        :disabled="disabled || isAnyActionLoading"
        :loading="isAnyActionLoading"
        @click="toggleDropdown"
        v-tooltip.top="'Actions'"
        class="action-btn dropdown-trigger"
        :class="{ 'touch-friendly': screenSize === 'mobile-xs' }"
        :touch-friendly="screenSize === 'mobile-xs'"
        :aria-label="`Actions for ${itemLabel}`"
        :aria-expanded="showDropdown"
        :aria-haspopup="true"
        ref="dropdownTrigger"
      />
      
      <!-- Dropdown Menu -->
      <div
        v-if="showDropdown"
        class="dropdown-menu"
        :class="{ 'touch-friendly': screenSize === 'mobile-xs' }"
        ref="dropdownMenu"
        @click.stop
        role="menu"
        :aria-label="`Actions menu for ${itemLabel}`"
      >
        <div 
          class="dropdown-item" 
          @click="handleView"
          :class="{ 'loading': loadingStates.view, 'disabled': disabled }"
          role="menuitem"
          tabindex="0"
          @keydown="handleDropdownItemKeydown($event, 'view')"
          :aria-label="`View details for ${itemLabel}`"
        >
          <i class="pi pi-eye" :class="{ 'pi-spin pi-spinner': loadingStates.view }"></i>
          <span>View Details</span>
        </div>
        <div 
          class="dropdown-item" 
          @click="handleEdit"
          :class="{ 'loading': loadingStates.edit, 'disabled': disabled }"
          role="menuitem"
          tabindex="0"
          @keydown="handleDropdownItemKeydown($event, 'edit')"
          :aria-label="`Edit ${itemLabel}`"
        >
          <i class="pi pi-pencil" :class="{ 'pi-spin pi-spinner': loadingStates.edit }"></i>
          <span>Edit</span>
        </div>
        <div 
          class="dropdown-item delete-item" 
          @click="handleDelete"
          :class="{ 'loading': loadingStates.delete, 'disabled': disabled }"
          role="menuitem"
          tabindex="0"
          @keydown="handleDropdownItemKeydown($event, 'delete')"
          :aria-label="`Delete ${itemLabel}`"
        >
          <i class="pi pi-trash" :class="{ 'pi-spin pi-spinner': loadingStates.delete }"></i>
          <span>Delete</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, reactive, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import { useLoadingState } from '~/composables/useLoadingState'
import { useAccessibility } from '~/composables/useAccessibility'

// Props Interface
interface QuickActionButtonsProps {
  item: Record<string, any>
  disabled?: boolean
  size?: 'small' | 'normal' | 'large'
  asyncActions?: boolean
}

// Props
const props = withDefaults(defineProps<QuickActionButtonsProps>(), {
  disabled: false,
  size: 'small',
  asyncActions: false
})

// Emits
const emit = defineEmits<{
  view: [item: Record<string, any>]
  edit: [item: Record<string, any>]
  delete: [item: Record<string, any>]
  actionStart: [action: 'view' | 'edit' | 'delete', item: Record<string, any>]
  actionComplete: [action: 'view' | 'edit' | 'delete', item: Record<string, any>]
  actionError: [action: 'view' | 'edit' | 'delete', error: Error, item: Record<string, any>]
}>()

// Reactive Data
const screenSize = ref('desktop')
const showDropdown = ref(false)
const dropdownTrigger = ref<HTMLElement>()
const dropdownMenu = ref<HTMLElement>()

// Button refs for accessing BaseButton methods
const viewButtonRef = ref<InstanceType<typeof BaseButton>>()
const editButtonRef = ref<InstanceType<typeof BaseButton>>()
const deleteButtonRef = ref<InstanceType<typeof BaseButton>>()

// Loading state management
const { setLoading, isLoading } = useLoadingState()
const loadingStates = reactive({
  view: false,
  edit: false,
  delete: false
})

// Accessibility management
const { 
  announceStateChange, 
  handleKeyboardNavigation,
  trapFocus,
  restoreFocus,
  prefersReducedMotion,
  prefersHighContrast
} = useAccessibility({
  announceStateChanges: true,
  respectReducedMotion: true,
  enableKeyboardNavigation: true,
  enableFocusManagement: true,
  enableHighContrast: true
})

// Computed Properties
const containerClasses = computed(() => [
  `screen-${screenSize.value}`,
  `size-${props.size}`,
  {
    'dropdown-open': showDropdown.value,
    'disabled': props.disabled,
    'has-loading': isAnyActionLoading.value
  }
])

const itemLabel = computed(() => {
  // Try to get a meaningful label from the item
  return props.item?.name || props.item?.title || props.item?.label || props.item?.id || 'item'
})

const isAnyActionLoading = computed(() => {
  return loadingStates.view || loadingStates.edit || loadingStates.delete
})

// Watch for loading state changes and announce them to screen readers
watch(() => loadingStates.view, (newLoading, oldLoading) => {
  if (newLoading !== oldLoading && newLoading) {
    announceStateChange('Loading', `View ${itemLabel.value}`)
  }
})

watch(() => loadingStates.edit, (newLoading, oldLoading) => {
  if (newLoading !== oldLoading && newLoading) {
    announceStateChange('Loading', `Edit ${itemLabel.value}`)
  }
})

watch(() => loadingStates.delete, (newLoading, oldLoading) => {
  if (newLoading !== oldLoading && newLoading) {
    announceStateChange('Loading', `Delete ${itemLabel.value}`)
  }
})

// Watch for dropdown state changes and announce them
watch(() => showDropdown.value, (newOpen, oldOpen) => {
  if (newOpen !== oldOpen) {
    const state = newOpen ? 'opened' : 'closed'
    announceStateChange(`Actions menu ${state}`, itemLabel.value)
  }
})

// Methods
async function handleView() {
  if (props.disabled || loadingStates.view) return
  
  closeDropdown()
  
  if (props.asyncActions) {
    await executeAction('view', async () => {
      emit('view', props.item)
    })
  } else {
    emit('view', props.item)
  }
}

async function handleEdit() {
  if (props.disabled || loadingStates.edit) return
  
  closeDropdown()
  
  if (props.asyncActions) {
    await executeAction('edit', async () => {
      emit('edit', props.item)
    })
  } else {
    emit('edit', props.item)
  }
}

async function handleDelete() {
  if (props.disabled || loadingStates.delete) return
  
  closeDropdown()
  
  if (props.asyncActions) {
    await executeAction('delete', async () => {
      emit('delete', props.item)
    })
  } else {
    emit('delete', props.item)
  }
}

// Execute action with proper loading state management
async function executeAction(action: 'view' | 'edit' | 'delete', actionFn: () => Promise<void>) {
  const actionKey = `quickaction-${action}-${props.item?.id || Date.now()}`
  
  try {
    // Set loading state
    loadingStates[action] = true
    setLoading(actionKey, true)
    emit('actionStart', action, props.item)
    
    // Execute the action
    await actionFn()
    
    // Emit completion event
    emit('actionComplete', action, props.item)
    
  } catch (error) {
    // Handle error
    const actionError = error instanceof Error ? error : new Error('Unknown error occurred')
    emit('actionError', action, actionError, props.item)
    
    // Re-throw to let BaseButton handle error state
    throw actionError
    
  } finally {
    // Clear loading state
    loadingStates[action] = false
    setLoading(actionKey, false)
  }
}

// Handle keyboard navigation in dropdown items
function handleDropdownItemKeydown(event: KeyboardEvent, action: 'view' | 'edit' | 'delete') {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    
    switch (action) {
      case 'view':
        handleView()
        break
      case 'edit':
        handleEdit()
        break
      case 'delete':
        handleDelete()
        break
    }
  } else if (event.key === 'Escape') {
    closeDropdown()
    // Focus back to trigger button
    nextTick(() => {
      const triggerButton = dropdownTrigger.value?.querySelector('button')
      triggerButton?.focus()
    })
  } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    navigateDropdownItems(event.key === 'ArrowDown' ? 1 : -1)
  }
}

// Navigate between dropdown items with arrow keys
function navigateDropdownItems(direction: 1 | -1) {
  if (!dropdownMenu.value) return
  
  const items = Array.from(dropdownMenu.value.querySelectorAll('.dropdown-item:not(.disabled)')) as HTMLElement[]
  const currentIndex = items.findIndex(item => item === document.activeElement)
  
  let nextIndex = currentIndex + direction
  
  // Wrap around
  if (nextIndex < 0) {
    nextIndex = items.length - 1
  } else if (nextIndex >= items.length) {
    nextIndex = 0
  }
  
  items[nextIndex]?.focus()
}

function toggleDropdown() {
  if (props.disabled || isAnyActionLoading.value) return
  
  showDropdown.value = !showDropdown.value
  
  if (showDropdown.value) {
    nextTick(() => {
      positionDropdown()
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleGlobalKeydown)
      
      // Focus first dropdown item for keyboard navigation
      const firstItem = dropdownMenu.value?.querySelector('.dropdown-item:not(.disabled)') as HTMLElement
      firstItem?.focus()
    })
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleGlobalKeydown)
  }
}

// Handle global keyboard events when dropdown is open
function handleGlobalKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeDropdown()
    // Focus back to trigger button
    nextTick(() => {
      const triggerButton = dropdownTrigger.value?.querySelector('button')
      triggerButton?.focus()
    })
  }
}

function closeDropdown() {
  showDropdown.value = false
  document.removeEventListener('click', handleClickOutside)
}

function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (
    dropdownTrigger.value &&
    dropdownMenu.value &&
    !dropdownTrigger.value.contains(target) &&
    !dropdownMenu.value.contains(target)
  ) {
    closeDropdown()
  }
}

function positionDropdown() {
  if (!dropdownMenu.value || !dropdownTrigger.value) return
  
  // Check if getBoundingClientRect is available (for testing compatibility)
  if (typeof dropdownTrigger.value.getBoundingClientRect !== 'function' ||
      typeof dropdownMenu.value.getBoundingClientRect !== 'function') {
    return
  }
  
  const triggerRect = dropdownTrigger.value.getBoundingClientRect()
  const menuRect = dropdownMenu.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  const viewportWidth = window.innerWidth
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  
  // For mobile, prefer positioning below the trigger
  let left = triggerRect.left + scrollX
  let top = triggerRect.bottom + scrollY + 8 // Increased spacing for touch
  
  // On mobile-xs, center the dropdown horizontally if possible
  if (screenSize.value === 'mobile-xs') {
    left = Math.max(12, Math.min(
      viewportWidth - menuRect.width - 12,
      triggerRect.left + scrollX + (triggerRect.width - menuRect.width) / 2
    ))
  }
  
  // Adjust if dropdown would go off-screen horizontally
  if (left + menuRect.width > viewportWidth) {
    left = viewportWidth - menuRect.width - 12
  }
  if (left < 12) {
    left = 12
  }
  
  // Adjust if dropdown would go off-screen vertically
  if (top + menuRect.height > viewportHeight + scrollY) {
    // Position above the trigger instead
    top = triggerRect.top + scrollY - menuRect.height - 8
    
    // If still off-screen, position at the top of viewport
    if (top < scrollY + 12) {
      top = scrollY + 12
    }
  }
  
  dropdownMenu.value.style.left = `${left}px`
  dropdownMenu.value.style.top = `${top}px`
  
  // Add animation class for smooth appearance
  dropdownMenu.value.classList.add('dropdown-appear')
}

function updateScreenSize() {
  const width = window.innerWidth
  if (width <= 480) {
    screenSize.value = 'mobile-xs'
  } else if (width <= 767) {
    screenSize.value = 'mobile'
  } else if (width <= 1023) {
    screenSize.value = 'tablet'
  } else {
    screenSize.value = 'desktop'
  }
  
  // Close dropdown if screen size changes
  if (showDropdown.value) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.quick-action-buttons {
  @apply flex items-center gap-1 relative;
}

/* Desktop Layout */
.screen-desktop {
  @apply gap-2;
}

.screen-desktop .action-btn {
  @apply px-3 py-1.5 text-sm;
}

/* Tablet Layout */
.screen-tablet {
  @apply gap-1;
}

.screen-tablet .action-btn.icon-only {
  @apply w-8 h-8 p-0 flex items-center justify-center;
}

/* Mobile Layout */
.screen-mobile,
.screen-mobile-xs {
  @apply relative;
}

.screen-mobile .dropdown-trigger {
  @apply w-8 h-8 p-0 flex items-center justify-center;
}

.screen-mobile-xs .dropdown-trigger {
  @apply w-10 h-10 p-0 flex items-center justify-center;
}

/* Touch-friendly styles for mobile-xs */
.screen-mobile-xs .dropdown-trigger.touch-friendly {
  @apply w-11 h-11 min-w-11 min-h-11;
}

/* Enhanced touch interactions */
.screen-mobile-xs .dropdown-trigger.touch-friendly:active {
  @apply transform scale-95 bg-gray-100;
  transition: all 0.1s ease;
}

.screen-mobile .dropdown-trigger:active {
  @apply transform scale-95 bg-gray-100;
  transition: all 0.1s ease;
}

/* Action Button Styles - Enhanced for BaseButton */
.action-btn {
  @apply transition-all duration-200 ease-in-out;
}

/* BaseButton integration - these styles work with the BaseButton component */
.action-btn :deep(.base-button) {
  @apply w-full h-full;
}

.action-btn.view-btn :deep(.base-button:hover:not(.base-button--disabled):not(.base-button--loading)) {
  @apply bg-blue-50 text-blue-600 border-blue-200;
}

.action-btn.edit-btn :deep(.base-button:hover:not(.base-button--disabled):not(.base-button--loading)) {
  @apply bg-amber-50 text-amber-600 border-amber-200;
}

.action-btn.delete-btn :deep(.base-button:hover:not(.base-button--disabled):not(.base-button--loading)) {
  @apply bg-red-50 text-red-600 border-red-200;
}

/* Loading state enhancements */
.action-btn :deep(.base-button--loading) {
  @apply cursor-wait;
}

.action-btn :deep(.base-button--loading .p-button-loading-icon) {
  @apply animate-spin;
}

/* Success state feedback */
.action-btn :deep(.base-button--success) {
  @apply bg-green-50 text-green-600 border-green-200;
}

/* Error state feedback */
.action-btn :deep(.base-button--error) {
  @apply bg-red-50 text-red-600 border-red-200;
}

/* Disabled State - Enhanced for BaseButton */
.disabled .action-btn :deep(.base-button),
.has-loading .action-btn :deep(.base-button:not(.base-button--loading)) {
  @apply opacity-50 cursor-not-allowed;
}

/* Dropdown Menu */
.dropdown-menu {
  @apply fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32;
  @apply animate-in fade-in-0 zoom-in-95 duration-200;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dropdown-menu.touch-friendly {
  @apply min-w-36 py-2;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.dropdown-item {
  @apply flex items-center gap-2 px-3 py-2 text-sm cursor-pointer;
  @apply hover:bg-gray-50 transition-colors duration-150;
  border-radius: 0.375rem;
  margin: 0 0.25rem;
}

.dropdown-menu.touch-friendly .dropdown-item {
  @apply px-4 py-3 text-base min-h-12;
  border-radius: 0.5rem;
  margin: 0 0.375rem;
}

.dropdown-item:active {
  @apply bg-gray-100 transform scale-95;
  transition: all 0.1s ease;
}

.dropdown-item i {
  @apply w-4 text-center flex-shrink-0;
}

.dropdown-menu.touch-friendly .dropdown-item i {
  @apply w-5 text-lg;
}

.dropdown-item.delete-item {
  @apply text-red-600 hover:bg-red-50;
}

.dropdown-item.delete-item:active {
  @apply bg-red-100;
}

/* Loading states for dropdown items */
.dropdown-item.loading {
  @apply opacity-75 cursor-wait;
}

.dropdown-item.loading i.pi-spin {
  @apply animate-spin;
}

.dropdown-item.disabled {
  @apply opacity-50 cursor-not-allowed pointer-events-none;
}

.dropdown-item.disabled:hover {
  @apply bg-transparent;
}

/* Size Variants */
.size-small .action-btn {
  @apply text-xs;
}

.size-normal .action-btn {
  @apply text-sm;
}

.size-large .action-btn {
  @apply text-base;
}

/* Responsive Adjustments */
@media (max-width: 767px) {
  .quick-action-buttons {
    @apply justify-end;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .screen-tablet .action-btn.icon-only {
    @apply w-7 h-7;
  }
}

/* Focus States for Accessibility */
.action-btn:focus-visible {
  @apply outline-2 outline-offset-2 outline-blue-500;
}

.dropdown-item:focus-visible {
  @apply outline-2 outline-offset-2 outline-blue-500 bg-gray-50;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .action-btn {
    border: 2px solid;
  }
  
  .action-btn:focus-visible {
    outline-width: 3px;
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .dropdown-menu {
    border: 2px solid;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }
  
  .dropdown-item {
    border: 1px solid transparent;
  }
  
  .dropdown-item:focus-visible {
    border-color: currentColor;
    outline-width: 3px;
  }
  
  .dropdown-item.delete-item {
    border-top: 2px solid;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .action-btn {
    transition: none;
  }
  
  .dropdown-trigger:active,
  .dropdown-item:active {
    transform: none;
    transition: none;
  }
  
  .dropdown-menu {
    animation: none;
  }
  
  .dropdown-appear {
    animation: none;
  }
  
  .animate-in {
    animation: none;
  }
}

/* Animation Classes */
@keyframes fade-in-0 {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in-95 {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}

@keyframes dropdown-appear {
  from { 
    opacity: 0; 
    transform: scale(0.9) translateY(-8px); 
  }
  to { 
    opacity: 1; 
    transform: scale(1) translateY(0); 
  }
}

.animate-in {
  animation-fill-mode: both;
}

.fade-in-0 {
  animation-name: fade-in-0;
}

.zoom-in-95 {
  animation-name: zoom-in-95;
}

.dropdown-appear {
  animation: dropdown-appear 200ms ease-out;
}

.duration-200 {
  animation-duration: 200ms;
}

/* Enhanced mobile interactions */
@media (max-width: 767px) {
  /* Improve touch feedback */
  .dropdown-trigger:active {
    background-color: var(--surface-100) !important;
    transform: scale(0.95);
  }
  
  .dropdown-item:active {
    background-color: var(--surface-200) !important;
    transform: scale(0.98);
  }
  
  /* Better visual feedback for touch */
  .dropdown-menu {
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  /* Improve dropdown positioning on mobile */
  .dropdown-menu.touch-friendly {
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.15), 
      0 10px 10px -5px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }
  
  /* Add subtle haptic-like feedback */
  .dropdown-item:active {
    transition: all 0.05s ease;
  }
  
  /* Ensure adequate spacing between touch targets */
  .dropdown-menu.touch-friendly .dropdown-item {
    margin-bottom: 0.125rem;
  }
  
  .dropdown-menu.touch-friendly .dropdown-item:last-child {
    margin-bottom: 0;
  }
}

/* Extra small screen optimizations */
@media (max-width: 480px) {
  .dropdown-menu.touch-friendly {
    min-width: 10rem;
    max-width: calc(100vw - 2rem);
  }
  
  .dropdown-item {
    font-size: 1rem;
    padding: 0.875rem 1rem;
    min-height: 3rem;
  }
  
  .dropdown-item i {
    width: 1.25rem;
    font-size: 1.125rem;
  }
  
  /* Improve visual hierarchy */
  .dropdown-item.delete-item {
    border-top: 1px solid var(--surface-border);
    margin-top: 0.25rem;
    padding-top: 1rem;
  }
}
</style>