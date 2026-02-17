<template>
  <component
    :is="linkComponent"
    :to="internalTo"
    :href="externalHref"
    :target="linkTarget"
    :rel="linkRel"
    :class="linkClasses"
    :aria-label="ariaLabel"
    :tabindex="tabindex"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { useAccessibility } from '~/composables/useAccessibility'

interface Props {
  to?: string
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  class?: string | string[] | Record<string, boolean>
  ariaLabel?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  target: undefined,
  rel: undefined,
  class: undefined,
  ariaLabel: undefined,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  error: [error: Error]
}>()

// Accessibility management
const { 
  handleKeyboardNavigation,
  generateAriaLabel,
  prefersHighContrast,
  announceToScreenReader
} = useAccessibility({
  announceStateChanges: true,
  enableKeyboardNavigation: true,
  enableHighContrast: true
})

// Determine the URL to use (props.to takes precedence over props.href)
const url = computed(() => props.to || props.href || '')

// Check if URL is internal (starts with / or is relative)
const isInternal = computed(() => {
  if (!url.value) return false
  
  try {
    // Handle relative paths and absolute internal paths
    if (url.value.startsWith('/') || url.value.startsWith('./') || url.value.startsWith('../')) {
      return true
    }
    
    // Handle hash links (same page navigation)
    if (url.value.startsWith('#')) {
      return false // Use anchor tag for hash links
    }
    
    // Check if it's an external URL
    const urlObj = new URL(url.value, window.location.origin)
    return urlObj.origin === window.location.origin
  } catch {
    // If URL parsing fails, treat as internal if it doesn't look like external URL
    return !url.value.includes('://') && !url.value.startsWith('mailto:') && !url.value.startsWith('tel:')
  }
})

// Determine which component to use
const linkComponent = computed(() => {
  if (!url.value) return 'span'
  return isInternal.value ? resolveComponent('NuxtLink') : 'a'
})

// Props for internal links (NuxtLink)
const internalTo = computed(() => {
  return isInternal.value ? url.value : undefined
})

// Props for external links (anchor tag)
const externalHref = computed(() => {
  return !isInternal.value ? url.value : undefined
})

// Determine target attribute
const linkTarget = computed(() => {
  if (props.target) return props.target
  
  // Auto-set target="_blank" for external links
  if (!isInternal.value && url.value && !url.value.startsWith('#')) {
    return '_blank'
  }
  
  return undefined
})

// Determine rel attribute
const linkRel = computed(() => {
  if (props.rel) return props.rel
  
  // Auto-set security attributes for external links
  if (!isInternal.value && linkTarget.value === '_blank') {
    return 'noopener noreferrer'
  }
  
  return undefined
})

// Handle CSS classes
const linkClasses = computed(() => {
  const classes = []
  
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      // Handle object format { 'class-name': boolean }
      Object.entries(props.class).forEach(([className, condition]) => {
        if (condition) classes.push(className)
      })
    }
  }
  
  // Add accessibility-related classes
  if (props.disabled) {
    classes.push('app-link--disabled')
  }
  
  if (prefersHighContrast()) {
    classes.push('app-link--high-contrast')
  }
  
  if (!isInternal.value) {
    classes.push('app-link--external')
  }
  
  return classes.join(' ')
})

// Accessibility attributes
const ariaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  
  // Auto-generate aria-label for external links
  if (!isInternal.value && linkTarget.value === '_blank') {
    return 'Opens in new tab'
  }
  
  return undefined
})

const tabindex = computed(() => {
  return props.disabled ? -1 : 0
})

// Click handler
const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  
  try {
    // Validate URL before navigation
    if (url.value && !isValidUrl(url.value)) {
      const error = new Error(`Invalid URL: ${url.value}`)
      emit('error', error)
      event.preventDefault()
      return
    }
    
    emit('click', event)
  } catch (error) {
    emit('error', error as Error)
    event.preventDefault()
  }
}

// Keyboard handler
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  // Use accessibility helper for keyboard navigation
  handleKeyboardNavigation(event, {
    Enter: (e) => {
      e.preventDefault()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      handleClick(clickEvent)
    },
    Space: (e) => {
      e.preventDefault()
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
      handleClick(clickEvent)
    }
  })
}

// URL validation helper
const isValidUrl = (urlString: string): boolean => {
  try {
    // Handle relative paths
    if (urlString.startsWith('/') || urlString.startsWith('./') || urlString.startsWith('../')) {
      return true
    }
    
    // Handle hash links
    if (urlString.startsWith('#')) {
      return true
    }
    
    // Handle special protocols
    if (urlString.startsWith('mailto:') || urlString.startsWith('tel:')) {
      return true
    }
    
    // Validate full URLs
    new URL(urlString)
    return true
  } catch {
    return false
  }
}
</script>

<style scoped>
.app-link--disabled {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}

/* Enhanced focus styles for accessibility */
a:focus,
a:focus-visible {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Remove default focus outline for mouse users */
a:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast mode support */
.app-link--high-contrast {
  text-decoration: underline;
  font-weight: 600;
}

.app-link--high-contrast:focus,
.app-link--high-contrast:focus-visible {
  outline: 3px solid;
  outline-offset: 2px;
  background-color: rgba(0, 0, 0, 0.1);
}

/* External link indicators */
.app-link--external::after {
  content: ' ↗';
  font-size: 0.8em;
  opacity: 0.7;
  margin-left: 0.2em;
}

.app-link--external:hover::after {
  opacity: 1;
}

/* Touch-friendly enhancements */
@media (hover: none) and (pointer: coarse) {
  a {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    padding: 0.5rem;
  }
  
  /* Improve touch feedback */
  a:active {
    background-color: rgba(0, 0, 0, 0.1);
    transform: scale(0.98);
    transition: all 0.1s ease;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  a {
    transition: none;
  }
  
  a:active {
    transform: none;
  }
}

/* Color contrast enhancements */
@media (prefers-contrast: high) {
  a {
    text-decoration: underline;
    text-decoration-thickness: 2px;
  }
  
  a:focus,
  a:focus-visible {
    outline-width: 3px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #000;
  }
  
  .app-link--disabled {
    opacity: 0.7;
    text-decoration: line-through;
  }
}

/* Dark mode considerations */
@media (prefers-color-scheme: dark) {
  a:focus,
  a:focus-visible {
    outline-color: #60a5fa;
  }
  
  .app-link--high-contrast:focus,
  .app-link--high-contrast:focus-visible {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

/* Ensure sufficient color contrast */
a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  color: #004499;
  text-decoration: underline;
}

a:visited {
  color: #663399;
}

/* Dark mode link colors */
@media (prefers-color-scheme: dark) {
  a {
    color: #66b3ff;
  }
  
  a:hover {
    color: #99ccff;
  }
  
  a:visited {
    color: #cc99ff;
  }
}

/* Screen reader only text for external links */
.app-link--external .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>