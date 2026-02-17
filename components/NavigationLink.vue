<template>
  <AppLink
    :to="to"
    :href="href"
    :target="target"
    :rel="rel"
    :class="navigationClasses"
    :aria-label="navigationAriaLabel"
    :aria-current="isActive ? 'page' : undefined"
    @click="handleNavClick"
    @error="handleError"
  >
    <slot />
  </AppLink>
</template>

<script setup lang="ts">
import { computed, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAccessibility } from '~/composables/useAccessibility'

interface Props {
  to?: string
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  class?: string | string[] | Record<string, boolean>
  ariaLabel?: string
  disabled?: boolean
  exact?: boolean
  activeClass?: string
  exactActiveClass?: string
  // Breadcrumb support
  breadcrumbLabel?: string
  breadcrumbLevel?: number
  // Nested navigation support
  hasChildren?: boolean
  isExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  target: undefined,
  rel: undefined,
  class: undefined,
  ariaLabel: undefined,
  disabled: false,
  exact: false,
  activeClass: 'nav-link--active',
  exactActiveClass: 'nav-link--exact-active',
  breadcrumbLabel: undefined,
  breadcrumbLevel: undefined,
  hasChildren: false,
  isExpanded: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  error: [error: Error]
  activate: [route: string]
  expand: [expanded: boolean]
}>()

const route = useRoute()
const router = useRouter()

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

// Determine the URL to use for active state detection
const navigationUrl = computed(() => props.to || props.href || '')

// Check if this link is currently active
const isActive = computed(() => {
  if (!navigationUrl.value || props.disabled) return false
  
  try {
    const currentPath = route.path
    const linkPath = navigationUrl.value
    
    if (props.exact) {
      // Exact match required
      return currentPath === linkPath
    } else {
      // Partial match (useful for nested routes)
      return currentPath.startsWith(linkPath) && linkPath !== '/'
    }
  } catch {
    return false
  }
})

// Check if this is an exact match (for different styling)
const isExactActive = computed(() => {
  if (!navigationUrl.value || props.disabled) return false
  
  try {
    return route.path === navigationUrl.value
  } catch {
    return false
  }
})

// Compute CSS classes including active states
const navigationClasses = computed(() => {
  const classes = ['nav-link']
  
  // Add base classes from props
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
  
  // Add active state classes
  if (isActive.value) {
    classes.push(props.activeClass)
  }
  
  if (isExactActive.value) {
    classes.push(props.exactActiveClass)
  }
  
  // Add nested navigation classes
  if (props.hasChildren) {
    classes.push('nav-link--has-children')
    if (props.isExpanded) {
      classes.push('nav-link--expanded')
    }
  }
  
  // Add breadcrumb classes
  if (props.breadcrumbLevel !== undefined) {
    classes.push('nav-link--breadcrumb')
    classes.push(`nav-link--breadcrumb-level-${props.breadcrumbLevel}`)
  }
  
  return classes
})

// Enhanced aria-label for navigation context
const navigationAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  
  let label = ''
  
  // Add breadcrumb context
  if (props.breadcrumbLabel) {
    label += `${props.breadcrumbLabel}, `
  }
  
  // Add active state context
  if (isActive.value) {
    label += 'current page, '
  }
  
  // Add nested navigation context
  if (props.hasChildren) {
    label += props.isExpanded ? 'expanded menu, ' : 'collapsed menu, '
  }
  
  return label || undefined
})

// Handle navigation clicks
const handleNavClick = (event: MouseEvent) => {
  if (props.disabled) return
  
  // Handle nested navigation expansion
  if (props.hasChildren && !navigationUrl.value) {
    event.preventDefault()
    const newExpanded = !props.isExpanded
    emit('expand', newExpanded)
    return
  }
  
  // Emit activation event for tracking
  if (navigationUrl.value) {
    emit('activate', navigationUrl.value)
  }
  
  emit('click', event)
}

// Handle errors from AppLink
const handleError = (error: Error) => {
  emit('error', error)
}

// Provide navigation context for nested components
const navigationContext = {
  isActive: isActive.value,
  isExactActive: isExactActive.value,
  level: (props.breadcrumbLevel || 0) + 1
}

// Make context available to child components
provide('navigationContext', navigationContext)

// Watch for active state changes and announce them to screen readers
watch(() => isActive.value, (newActive, oldActive) => {
  if (newActive !== oldActive && newActive && navigationUrl.value) {
    const linkText = navigationUrl.value
    announceStateChange('Current page', linkText)
  }
})

// Watch for expansion state changes and announce them
watch(() => props.isExpanded, (newExpanded, oldExpanded) => {
  if (newExpanded !== oldExpanded && props.hasChildren) {
    const state = newExpanded ? 'expanded' : 'collapsed'
    const context = props.breadcrumbLabel || 'menu'
    announceStateChange(state, context)
  }
})
</script>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

/* Base hover effects */
.nav-link:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Active state styling */
.nav-link--active {
  font-weight: 600;
}

.nav-link--exact-active {
  font-weight: 700;
}

/* Focus styles for accessibility */
.nav-link:focus,
.nav-link:focus-visible {
  outline: 2px solid var(--primary-color, #007bff);
  outline-offset: 2px;
  border-radius: 4px;
}

.nav-link:focus:not(:focus-visible) {
  outline: none;
}

/* Nested navigation styles */
.nav-link--has-children {
  position: relative;
}

.nav-link--has-children::after {
  content: '';
  margin-left: 0.5rem;
  border: solid transparent;
  border-width: 4px 4px 0 4px;
  border-top-color: currentColor;
  transition: transform 0.3s ease;
}

.nav-link--expanded::after {
  transform: rotate(180deg);
}

/* Breadcrumb styles */
.nav-link--breadcrumb {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.nav-link--breadcrumb:not(:last-child)::after {
  content: '/';
  margin: 0 0.5rem;
  color: var(--text-muted, #6b7280);
  font-weight: normal;
}

.nav-link--breadcrumb-level-0 {
  font-weight: 600;
}

.nav-link--breadcrumb-level-1 {
  font-weight: 500;
}

.nav-link--breadcrumb-level-2 {
  font-weight: 400;
}

/* Smooth transitions */
.nav-link {
  transition: 
    color 0.3s ease,
    background-color 0.3s ease,
    transform 0.3s ease,
    opacity 0.3s ease;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .nav-link,
  .nav-link::after {
    transition: none;
  }
  
  .nav-link:hover {
    transform: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .nav-link:focus,
  .nav-link:focus-visible {
    outline: 3px solid;
    outline-offset: 2px;
  }
  
  .nav-link--active,
  .nav-link--exact-active {
    text-decoration: underline;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .nav-link {
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem;
  }
  
  .nav-link:hover {
    transform: none;
    opacity: 1;
  }
}
</style>