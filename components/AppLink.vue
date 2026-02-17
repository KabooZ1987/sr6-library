<template>
  <a
    v-if="url"
    v-bind="componentProps"
    :href="hrefValue"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot />
  </a>
  <span
    v-else
    v-bind="componentProps"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRequestURL } from '#imports'
import { useAccessibility } from '~/composables/useAccessibility'

interface Props {
  to?: string | object
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  class?: string | string[] | Record<string, boolean>
  ariaLabel?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  to: undefined,
  href: undefined,
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

const router = useRouter()

// Accessibility management
const { 
  handleKeyboardNavigation,
  prefersHighContrast
} = useAccessibility({
  announceStateChanges: true,
  enableKeyboardNavigation: true,
  enableHighContrast: true
})

// Determine the URL to use (props.to takes precedence over props.href)
const url = computed(() => props.to || props.href || '')

// Check if URL is internal
const isInternal = computed(() => {
  if (!url.value) return false
  
  // If it's an object, it's a Vue Router location, so it's internal
  if (typeof url.value === 'object') return true
  
  const urlString = String(url.value)
  
  try {
    // Handle relative paths and absolute internal paths
    if (urlString.startsWith('/') || urlString.startsWith('./') || urlString.startsWith('../')) {
      return true
    }
    
    // Handle hash links (same page navigation)
    if (urlString.startsWith('#')) {
      return false // Use anchor tag for hash links
    }
    
    // Get current origin safely
    let currentOrigin = ''
    try {
      if (typeof window !== 'undefined' && window.location) {
        currentOrigin = window.location.origin
      } else {
        currentOrigin = useRequestURL().origin
      }
    } catch {
      // Fallback if useRequestURL fails
    }
    
    if (currentOrigin) {
      const urlObj = new URL(urlString, currentOrigin)
      return urlObj.origin === currentOrigin
    }
    
    // Fallback: Check if it looks like an external URL
    return !urlString.includes('://') && !urlString.startsWith('mailto:') && !urlString.startsWith('tel:')
  } catch {
    return !urlString.includes('://') && !urlString.startsWith('mailto:') && !urlString.startsWith('tel:')
  }
})

// Determine target attribute
const linkTarget = computed(() => {
  if (props.target) return props.target
  
  // Auto-set target="_blank" for external links
  if (!isInternal.value && url.value && typeof url.value === 'string' && !url.value.startsWith('#')) {
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
  const classes: string[] = []
  
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      Object.entries(props.class).forEach(([className, condition]) => {
        if (condition) classes.push(className)
      })
    }
  }
  
  if (props.disabled) classes.push('app-link--disabled')
  if (prefersHighContrast()) classes.push('app-link--high-contrast')
  if (!isInternal.value && url.value) classes.push('app-link--external')
  
  return classes.join(' ')
})

// Accessibility attributes
const ariaLabelValue = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (!isInternal.value && linkTarget.value === '_blank') return 'Opens in new tab'
  return undefined
})

const tabindex = computed(() => props.disabled ? -1 : 0)

// Href value logic
const hrefValue = computed(() => {
  if (!url.value) return undefined
  if (typeof url.value === 'string') return url.value
  
  try {
    return router.resolve(url.value).href
  } catch {
    return '#'
  }
})

// Component props logic
const componentProps = computed(() => {
  const p: Record<string, any> = {
    class: linkClasses.value,
    'aria-label': ariaLabelValue.value,
    tabindex: tabindex.value
  }

  if (!url.value) {
    p.role = 'link'
    p['aria-disabled'] = 'true'
  } else {
    p.target = linkTarget.value
    p.rel = linkRel.value
  }

  return p
})

// Click handler
const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  // URL validation helper (inlined for simplicity)
  const isValid = (urlString: string): boolean => {
    if (!urlString) return false
    if (urlString.startsWith('/') || urlString.startsWith('./') || urlString.startsWith('../')) return true
    if (urlString.startsWith('#')) return true
    if (urlString.startsWith('mailto:') || urlString.startsWith('tel:')) return true
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  try {
    if (url.value && typeof url.value === 'string' && !isValid(url.value)) {
      const error = new Error(`Invalid URL: ${url.value}`)
      emit('error', error)
      event.preventDefault()
      return
    }
    
    // Emit click event first so listeners can prevent default if needed
    emit('click', event)

    if (event.defaultPrevented) return

    // Manual navigation for internal links
    const isNormalClick = event.button === 0 && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
    
    if (isInternal.value && isNormalClick && linkTarget.value !== '_blank' && url.value) {
      event.preventDefault()
      router.push(url.value as any)
    }
  } catch (error) {
    emit('error', error as Error)
  }
}

// Keyboard handler
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  handleKeyboardNavigation(event, {
    Enter: (e) => {
      // Browser handles Enter on <a>
    },
    Space: (e) => {
      e.preventDefault()
      const target = e.currentTarget as HTMLElement
      target.click()
    }
  })
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