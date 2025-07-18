<template>
  <div class="quick-action-buttons" :class="containerClasses">
    <!-- Desktop: Full buttons with text -->
    <template v-if="screenSize === 'desktop'">
      <Button
        icon="pi pi-eye"
        label="View"
        severity="info"
        text
        size="small"
        @click="handleView"
        v-tooltip.top="'View Details'"
        class="action-btn view-btn"
        :disabled="disabled"
      />
      <Button
        icon="pi pi-pencil"
        label="Edit"
        severity="warning"
        text
        size="small"
        @click="handleEdit"
        v-tooltip.top="'Edit'"
        class="action-btn edit-btn"
        :disabled="disabled"
      />
      <Button
        icon="pi pi-trash"
        label="Delete"
        severity="danger"
        text
        size="small"
        @click="handleDelete"
        v-tooltip.top="'Delete'"
        class="action-btn delete-btn"
        :disabled="disabled"
      />
    </template>

    <!-- Tablet: Icons only with tooltips -->
    <template v-else-if="screenSize === 'tablet'">
      <Button
        icon="pi pi-eye"
        severity="info"
        text
        rounded
        size="small"
        @click="handleView"
        v-tooltip.top="'View Details'"
        class="action-btn view-btn icon-only"
        :disabled="disabled"
      />
      <Button
        icon="pi pi-pencil"
        severity="warning"
        text
        rounded
        size="small"
        @click="handleEdit"
        v-tooltip.top="'Edit'"
        class="action-btn edit-btn icon-only"
        :disabled="disabled"
      />
      <Button
        icon="pi pi-trash"
        severity="danger"
        text
        rounded
        size="small"
        @click="handleDelete"
        v-tooltip.top="'Delete'"
        class="action-btn delete-btn icon-only"
        :disabled="disabled"
      />
    </template>

    <!-- Mobile: Dropdown menu -->
    <template v-else>
      <Button
        icon="pi pi-ellipsis-v"
        severity="secondary"
        text
        rounded
        :size="screenSize === 'mobile-xs' ? 'normal' : 'small'"
        @click="toggleDropdown"
        v-tooltip.top="'Actions'"
        class="action-btn dropdown-trigger"
        :class="{ 'touch-friendly': screenSize === 'mobile-xs' }"
        :disabled="disabled"
        ref="dropdownTrigger"
      />
      
      <!-- Dropdown Menu -->
      <div
        v-if="showDropdown"
        class="dropdown-menu"
        :class="{ 'touch-friendly': screenSize === 'mobile-xs' }"
        ref="dropdownMenu"
        @click.stop
      >
        <div class="dropdown-item" @click="handleView">
          <i class="pi pi-eye"></i>
          <span>View Details</span>
        </div>
        <div class="dropdown-item" @click="handleEdit">
          <i class="pi pi-pencil"></i>
          <span>Edit</span>
        </div>
        <div class="dropdown-item delete-item" @click="handleDelete">
          <i class="pi pi-trash"></i>
          <span>Delete</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Props Interface
interface QuickActionButtonsProps {
  item: Record<string, any>
  disabled?: boolean
  size?: 'small' | 'normal' | 'large'
}

// Props
const props = withDefaults(defineProps<QuickActionButtonsProps>(), {
  disabled: false,
  size: 'small'
})

// Emits
const emit = defineEmits<{
  view: [item: Record<string, any>]
  edit: [item: Record<string, any>]
  delete: [item: Record<string, any>]
}>()

// Reactive Data
const screenSize = ref('desktop')
const showDropdown = ref(false)
const dropdownTrigger = ref<HTMLElement>()
const dropdownMenu = ref<HTMLElement>()

// Computed Properties
const containerClasses = computed(() => [
  `screen-${screenSize.value}`,
  `size-${props.size}`,
  {
    'dropdown-open': showDropdown.value,
    'disabled': props.disabled
  }
])

// Methods
function handleView() {
  if (props.disabled) return
  closeDropdown()
  emit('view', props.item)
}

function handleEdit() {
  if (props.disabled) return
  closeDropdown()
  emit('edit', props.item)
}

function handleDelete() {
  if (props.disabled) return
  closeDropdown()
  emit('delete', props.item)
}

function toggleDropdown() {
  if (props.disabled) return
  showDropdown.value = !showDropdown.value
  
  if (showDropdown.value) {
    nextTick(() => {
      positionDropdown()
      document.addEventListener('click', handleClickOutside)
    })
  } else {
    document.removeEventListener('click', handleClickOutside)
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

/* Action Button Styles */
.action-btn {
  @apply transition-all duration-200 ease-in-out;
}

.action-btn:hover:not(:disabled) {
  @apply transform scale-105;
}

.action-btn:active:not(:disabled) {
  @apply transform scale-95;
}

.action-btn.view-btn:hover:not(:disabled) {
  @apply bg-blue-50 text-blue-600;
}

.action-btn.edit-btn:hover:not(:disabled) {
  @apply bg-amber-50 text-amber-600;
}

.action-btn.delete-btn:hover:not(:disabled) {
  @apply bg-red-50 text-red-600;
}

/* Disabled State */
.disabled .action-btn {
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