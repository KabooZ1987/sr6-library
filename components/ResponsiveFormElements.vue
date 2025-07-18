<template>
  <div class="responsive-form-elements">
    <!-- Responsive Input Field -->
    <div v-if="type === 'input'" class="form-field">
      <label v-if="label" :for="fieldId" class="field-label">{{ label }}</label>
      <InputText
        :id="fieldId"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        :style="inputStyles"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <!-- Responsive Textarea -->
    <div v-else-if="type === 'textarea'" class="form-field">
      <label v-if="label" :for="fieldId" class="field-label">{{ label }}</label>
      <Textarea
        :id="fieldId"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :class="textareaClasses"
        :style="inputStyles"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <!-- Responsive Dropdown -->
    <div v-else-if="type === 'dropdown'" class="form-field">
      <label v-if="label" :for="fieldId" class="field-label">{{ label }}</label>
      <Dropdown
        :id="fieldId"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :options="options"
        :optionLabel="optionLabel"
        :optionValue="optionValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="dropdownClasses"
        :style="inputStyles"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>

    <!-- Responsive Button -->
    <div v-else-if="type === 'button'" class="form-field">
      <Button
        :label="label"
        :icon="icon"
        :severity="severity"
        :size="buttonSize"
        :disabled="disabled"
        :class="buttonClasses"
        :style="buttonStyles"
        @click="$emit('click', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props Interface
interface ResponsiveFormElementsProps {
  type: 'input' | 'textarea' | 'dropdown' | 'button'
  modelValue?: any
  label?: string
  placeholder?: string
  disabled?: boolean
  options?: Array<any>
  optionLabel?: string
  optionValue?: string
  rows?: number
  icon?: string
  severity?: string
  fieldId?: string
}

// Props
const props = withDefaults(defineProps<ResponsiveFormElementsProps>(), {
  type: 'input',
  modelValue: '',
  disabled: false,
  rows: 3,
  fieldId: () => `field-${Math.random().toString(36).substr(2, 9)}`
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any]
  click: [event: Event]
  focus: [event: Event]
  blur: [event: Event]
}>()

// Reactive Data
const screenSize = ref('desktop')
const isFocused = ref(false)

// Computed Properties
const inputClasses = computed(() => [
  'responsive-input',
  `screen-${screenSize.value}`,
  {
    'touch-friendly': screenSize.value === 'mobile-xs' || screenSize.value === 'mobile',
    'focused': isFocused.value
  }
])

const textareaClasses = computed(() => [
  'responsive-textarea',
  `screen-${screenSize.value}`,
  {
    'touch-friendly': screenSize.value === 'mobile-xs' || screenSize.value === 'mobile',
    'focused': isFocused.value
  }
])

const dropdownClasses = computed(() => [
  'responsive-dropdown',
  `screen-${screenSize.value}`,
  {
    'touch-friendly': screenSize.value === 'mobile-xs' || screenSize.value === 'mobile'
  }
])

const buttonClasses = computed(() => [
  'responsive-button',
  `screen-${screenSize.value}`,
  {
    'touch-friendly': screenSize.value === 'mobile-xs' || screenSize.value === 'mobile'
  }
])

const buttonSize = computed(() => {
  if (screenSize.value === 'mobile-xs') return 'normal'
  if (screenSize.value === 'mobile') return 'small'
  return 'small'
})

const inputStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (screenSize.value === 'mobile-xs' || screenSize.value === 'mobile') {
    styles.fontSize = '1rem' // Prevent zoom on iOS
    styles.minHeight = '2.75rem'
  }
  
  return styles
})

const buttonStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  if (screenSize.value === 'mobile-xs') {
    styles.minHeight = '2.75rem'
    styles.padding = '0.75rem 1.5rem'
  } else if (screenSize.value === 'mobile') {
    styles.minHeight = '2.5rem'
    styles.padding = '0.625rem 1.25rem'
  }
  
  return styles
})

// Methods
function handleFocus(event: Event) {
  isFocused.value = true
  emit('focus', event)
}

function handleBlur(event: Event) {
  isFocused.value = false
  emit('blur', event)
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
}

// Lifecycle
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.responsive-form-elements {
  width: 100%;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.field-label {
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

/* Input Styles */
.responsive-input,
.responsive-textarea,
.responsive-dropdown {
  width: 100%;
  transition: all 0.2s ease;
}

.responsive-input.touch-friendly,
.responsive-textarea.touch-friendly,
.responsive-dropdown.touch-friendly {
  font-size: 1rem !important; /* Prevent zoom on iOS */
  min-height: 2.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.responsive-input.focused,
.responsive-textarea.focused {
  transform: scale(1.01);
  box-shadow: 0 0 0 2px var(--primary-color-alpha);
}

/* Textarea specific */
.responsive-textarea.touch-friendly {
  min-height: 4rem;
  resize: vertical;
}

/* Dropdown specific */
.responsive-dropdown.touch-friendly :deep(.p-dropdown-trigger) {
  min-width: 2.75rem;
  min-height: 2.75rem;
}

.responsive-dropdown.touch-friendly :deep(.p-dropdown-label) {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

/* Button Styles */
.responsive-button {
  transition: all 0.2s ease;
}

.responsive-button.touch-friendly {
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.responsive-button:active {
  transform: scale(0.98);
}

.responsive-button.touch-friendly:active {
  transform: scale(0.95);
}

/* Screen-specific adjustments */
@media (max-width: 480px) {
  .field-label {
    font-size: 0.8rem;
  }
  
  .responsive-input.screen-mobile-xs,
  .responsive-textarea.screen-mobile-xs,
  .responsive-dropdown.screen-mobile-xs {
    font-size: 1rem !important;
    min-height: 3rem;
    padding: 0.875rem 1rem;
  }
  
  .responsive-textarea.screen-mobile-xs {
    min-height: 4.5rem;
  }
  
  .responsive-button.screen-mobile-xs {
    min-height: 3rem;
    padding: 0.875rem 1.75rem;
    font-size: 1.05rem;
    font-weight: 500;
  }
}

@media (min-width: 481px) and (max-width: 767px) {
  .responsive-input.screen-mobile,
  .responsive-textarea.screen-mobile,
  .responsive-dropdown.screen-mobile {
    min-height: 2.5rem;
    padding: 0.625rem 0.875rem;
  }
  
  .responsive-textarea.screen-mobile {
    min-height: 3.5rem;
  }
  
  .responsive-button.screen-mobile {
    min-height: 2.5rem;
    padding: 0.625rem 1.25rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .responsive-input.screen-tablet,
  .responsive-textarea.screen-tablet,
  .responsive-dropdown.screen-tablet {
    min-height: 2.25rem;
    padding: 0.5rem 0.75rem;
  }
  
  .responsive-textarea.screen-tablet {
    min-height: 3rem;
  }
  
  .responsive-button.screen-tablet {
    min-height: 2.25rem;
    padding: 0.5rem 1rem;
  }
}

/* Focus and interaction improvements */
.responsive-input:focus,
.responsive-textarea:focus,
.responsive-dropdown:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.responsive-button:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .field-label {
    color: var(--text-color);
  }
  
  .responsive-input.focused,
  .responsive-textarea.focused {
    box-shadow: 0 0 0 2px var(--primary-color-alpha);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .responsive-input,
  .responsive-textarea,
  .responsive-dropdown,
  .responsive-button {
    border: 2px solid var(--text-color);
  }
  
  .responsive-input:focus,
  .responsive-textarea:focus,
  .responsive-dropdown:focus,
  .responsive-button:focus-visible {
    outline: 3px solid var(--primary-color);
    outline-offset: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .responsive-input,
  .responsive-textarea,
  .responsive-dropdown,
  .responsive-button {
    transition: none;
  }
  
  .responsive-input.focused,
  .responsive-textarea.focused {
    transform: none;
  }
  
  .responsive-button:active,
  .responsive-button.touch-friendly:active {
    transform: none;
  }
}

/* Enhanced mobile touch interactions */
@media (max-width: 767px) {
  /* Improve touch feedback for all form elements */
  .responsive-input:active,
  .responsive-textarea:active {
    background-color: var(--surface-50);
    transition: background-color 0.1s ease;
  }
  
  /* Better dropdown touch handling */
  .responsive-dropdown.touch-friendly :deep(.p-dropdown) {
    border-radius: 0.5rem;
  }
  
  .responsive-dropdown.touch-friendly :deep(.p-dropdown:focus) {
    box-shadow: 0 0 0 2px var(--primary-color-alpha);
  }
  
  /* Improve button press feedback */
  .responsive-button.touch-friendly:active {
    background-color: var(--primary-color-dark);
    transform: scale(0.95);
    transition: all 0.1s ease;
  }
  
  /* Better visual hierarchy for labels */
  .field-label {
    color: var(--text-color);
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  /* Improve form field spacing */
  .form-field {
    margin-bottom: 1rem;
  }
  
  /* Better error state handling */
  .responsive-input.p-invalid,
  .responsive-textarea.p-invalid,
  .responsive-dropdown.p-invalid {
    border-color: var(--red-500);
    box-shadow: 0 0 0 1px var(--red-500);
  }
  
  /* Improve placeholder text visibility */
  .responsive-input::placeholder,
  .responsive-textarea::placeholder {
    color: var(--text-color-secondary);
    opacity: 0.7;
  }
}

/* Extra small screen optimizations */
@media (max-width: 480px) {
  /* Larger touch targets for very small screens */
  .responsive-input.screen-mobile-xs,
  .responsive-textarea.screen-mobile-xs,
  .responsive-dropdown.screen-mobile-xs {
    min-height: 3.25rem;
    padding: 1rem;
    font-size: 1.1rem;
    border-radius: 0.75rem;
  }
  
  .responsive-button.screen-mobile-xs {
    min-height: 3.25rem;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 0.75rem;
  }
  
  /* Better label sizing */
  .field-label {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
  
  /* Improve form spacing */
  .form-field {
    margin-bottom: 1.5rem;
  }
  
  /* Better dropdown arrow sizing */
  .responsive-dropdown.screen-mobile-xs :deep(.p-dropdown-trigger) {
    min-width: 3rem;
    min-height: 3rem;
  }
  
  /* Improve textarea resize handle */
  .responsive-textarea.screen-mobile-xs {
    resize: vertical;
    min-height: 5rem;
  }
}
</style>