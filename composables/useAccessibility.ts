import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export interface AccessibilityOptions {
  announceStateChanges?: boolean
  respectReducedMotion?: boolean
  enableKeyboardNavigation?: boolean
  enableFocusManagement?: boolean
  enableHighContrast?: boolean
  announceDelay?: number
}

export interface AccessibilityReturn {
  // Screen reader announcements
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  announceStateChange: (state: string, context?: string) => void
  
  // Focus management
  manageFocus: (element: HTMLElement | null) => void
  trapFocus: (container: HTMLElement) => () => void
  restoreFocus: () => void
  
  // Keyboard navigation
  handleKeyboardNavigation: (event: KeyboardEvent, handlers: KeyboardHandlers) => void
  
  // Accessibility preferences
  prefersReducedMotion: () => boolean
  prefersHighContrast: () => boolean
  prefersColorScheme: () => 'light' | 'dark' | 'no-preference'
  
  // ARIA helpers
  generateAriaLabel: (base: string, state?: AccessibilityState) => string
  generateAriaDescription: (context: string, instructions?: string[]) => string
  
  // Color contrast utilities
  checkColorContrast: (foreground: string, background: string) => { ratio: number; passes: boolean }
  ensureMinimumContrast: (foreground: string, background: string, minRatio?: number) => string
}

export interface KeyboardHandlers {
  Enter?: (event: KeyboardEvent) => void
  Space?: (event: KeyboardEvent) => void
  Escape?: (event: KeyboardEvent) => void
  ArrowUp?: (event: KeyboardEvent) => void
  ArrowDown?: (event: KeyboardEvent) => void
  ArrowLeft?: (event: KeyboardEvent) => void
  ArrowRight?: (event: KeyboardEvent) => void
  Tab?: (event: KeyboardEvent) => void
  Home?: (event: KeyboardEvent) => void
  End?: (event: KeyboardEvent) => void
}

export interface AccessibilityState {
  loading?: boolean
  error?: string | null
  success?: boolean
  disabled?: boolean
  expanded?: boolean
  selected?: boolean
  pressed?: boolean
}

export function useAccessibility(options: AccessibilityOptions = {}): AccessibilityReturn {
  const {
    announceStateChanges = true,
    respectReducedMotion = true,
    enableKeyboardNavigation = true,
    enableFocusManagement = true,
    enableHighContrast = true,
    announceDelay = 100
  } = options

  // Live region for screen reader announcements
  const liveRegion = ref<HTMLElement | null>(null)
  const previousFocus = ref<HTMLElement | null>(null)
  
  // Media query refs
  const reducedMotionQuery = ref<MediaQueryList | null>(null)
  const highContrastQuery = ref<MediaQueryList | null>(null)
  const colorSchemeQuery = ref<MediaQueryList | null>(null)

  // Initialize live region for screen reader announcements
  const initializeLiveRegion = () => {
    if (typeof document === 'undefined') return
    
    // Create or find existing live region
    let region = document.getElementById('accessibility-live-region')
    if (!region) {
      region = document.createElement('div')
      region.id = 'accessibility-live-region'
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.style.position = 'absolute'
      region.style.left = '-10000px'
      region.style.width = '1px'
      region.style.height = '1px'
      region.style.overflow = 'hidden'
      document.body.appendChild(region)
    }
    liveRegion.value = region
  }

  // Screen reader announcements
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceStateChanges || !liveRegion.value) return
    
    // Clear previous message
    liveRegion.value.textContent = ''
    liveRegion.value.setAttribute('aria-live', priority)
    
    // Add new message after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (liveRegion.value) {
        liveRegion.value.textContent = message
      }
    }, announceDelay)
  }

  const announceStateChange = (state: string, context?: string) => {
    if (!announceStateChanges) return
    
    const message = context ? `${context}: ${state}` : state
    announceToScreenReader(message, 'polite')
  }

  // Focus management
  const manageFocus = (element: HTMLElement | null) => {
    if (!enableFocusManagement || !element) return
    
    nextTick(() => {
      element.focus()
    })
  }

  const trapFocus = (container: HTMLElement): (() => void) => {
    if (!enableFocusManagement) return () => {}
    
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    
    // Focus first element
    if (firstElement) {
      firstElement.focus()
    }
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  const restoreFocus = () => {
    if (!enableFocusManagement || !previousFocus.value) return
    
    nextTick(() => {
      if (previousFocus.value && document.contains(previousFocus.value)) {
        previousFocus.value.focus()
      }
      previousFocus.value = null
    })
  }

  // Store current focus before moving it
  const storeFocus = () => {
    if (enableFocusManagement) {
      previousFocus.value = document.activeElement as HTMLElement
    }
  }

  // Keyboard navigation
  const handleKeyboardNavigation = (event: KeyboardEvent, handlers: KeyboardHandlers) => {
    if (!enableKeyboardNavigation) return
    
    const handler = handlers[event.key as keyof KeyboardHandlers]
    if (handler) {
      handler(event)
    }
  }

  // Accessibility preferences
  const prefersReducedMotion = (): boolean => {
    if (!respectReducedMotion || typeof window === 'undefined') return false
    return reducedMotionQuery.value?.matches ?? false
  }

  const prefersHighContrast = (): boolean => {
    if (!enableHighContrast || typeof window === 'undefined') return false
    return highContrastQuery.value?.matches ?? false
  }

  const prefersColorScheme = (): 'light' | 'dark' | 'no-preference' => {
    if (typeof window === 'undefined') return 'no-preference'
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'no-preference'
  }

  // ARIA helpers
  const generateAriaLabel = (base: string, state?: AccessibilityState): string => {
    const parts = [base]
    
    if (state?.loading) parts.push('loading')
    if (state?.error) parts.push(`error: ${state.error}`)
    if (state?.success) parts.push('completed successfully')
    if (state?.disabled) parts.push('disabled')
    if (state?.expanded !== undefined) parts.push(state.expanded ? 'expanded' : 'collapsed')
    if (state?.selected) parts.push('selected')
    if (state?.pressed !== undefined) parts.push(state.pressed ? 'pressed' : 'not pressed')
    
    return parts.join(', ')
  }

  const generateAriaDescription = (context: string, instructions: string[] = []): string => {
    const parts = [context]
    
    if (instructions.length > 0) {
      parts.push('Instructions:')
      parts.push(...instructions)
    }
    
    return parts.join(' ')
  }

  // Color contrast utilities
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  const checkColorContrast = (foreground: string, background: string): { ratio: number; passes: boolean } => {
    const fgRgb = hexToRgb(foreground)
    const bgRgb = hexToRgb(background)
    
    if (!fgRgb || !bgRgb) {
      return { ratio: 0, passes: false }
    }
    
    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b)
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
    
    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
    
    // WCAG AA standard requires 4.5:1 for normal text, 3:1 for large text
    const passes = ratio >= 4.5
    
    return { ratio, passes }
  }

  const ensureMinimumContrast = (foreground: string, background: string, minRatio: number = 4.5): string => {
    const contrast = checkColorContrast(foreground, background)
    
    if (contrast.passes && contrast.ratio >= minRatio) {
      return foreground
    }
    
    // Simple fallback: return high contrast colors
    const bgRgb = hexToRgb(background)
    if (!bgRgb) return foreground
    
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b)
    
    // If background is light, return dark text; if dark, return light text
    return bgLuminance > 0.5 ? '#000000' : '#ffffff'
  }

  // Initialize media queries
  const initializeMediaQueries = () => {
    if (typeof window === 'undefined') return
    
    if (respectReducedMotion) {
      reducedMotionQuery.value = window.matchMedia('(prefers-reduced-motion: reduce)')
    }
    
    if (enableHighContrast) {
      highContrastQuery.value = window.matchMedia('(prefers-contrast: high)')
    }
    
    colorSchemeQuery.value = window.matchMedia('(prefers-color-scheme: dark)')
  }

  // Lifecycle
  onMounted(() => {
    initializeLiveRegion()
    initializeMediaQueries()
  })

  onUnmounted(() => {
    // Cleanup live region if we created it
    if (liveRegion.value && liveRegion.value.id === 'accessibility-live-region') {
      liveRegion.value.remove()
    }
  })

  return {
    announceToScreenReader,
    announceStateChange,
    manageFocus,
    trapFocus,
    restoreFocus,
    handleKeyboardNavigation,
    prefersReducedMotion,
    prefersHighContrast,
    prefersColorScheme,
    generateAriaLabel,
    generateAriaDescription,
    checkColorContrast,
    ensureMinimumContrast
  }
}

// Convenience composable for common accessibility patterns
export function useAccessibilityHelpers() {
  const accessibility = useAccessibility()
  
  return {
    ...accessibility,
    
    // Common button accessibility
    enhanceButtonAccessibility: (
      element: HTMLElement,
      label: string,
      state?: AccessibilityState
    ) => {
      const ariaLabel = accessibility.generateAriaLabel(label, state)
      element.setAttribute('aria-label', ariaLabel)
      
      if (state?.loading) {
        element.setAttribute('aria-busy', 'true')
      } else {
        element.removeAttribute('aria-busy')
      }
      
      if (state?.disabled) {
        element.setAttribute('aria-disabled', 'true')
      } else {
        element.removeAttribute('aria-disabled')
      }
    },
    
    // Common link accessibility
    enhanceLinkAccessibility: (
      element: HTMLElement,
      isExternal: boolean = false,
      opensNewTab: boolean = false
    ) => {
      if (isExternal) {
        element.setAttribute('rel', 'noopener noreferrer')
      }
      
      if (opensNewTab) {
        const currentLabel = element.getAttribute('aria-label') || element.textContent || ''
        element.setAttribute('aria-label', `${currentLabel} (opens in new tab)`)
      }
    },
    
    // Common form accessibility
    enhanceFormAccessibility: (
      input: HTMLElement,
      label: string,
      error?: string,
      description?: string
    ) => {
      const inputId = input.id || `input-${Date.now()}`
      input.id = inputId
      
      // Associate label
      const labelElement = document.querySelector(`label[for="${inputId}"]`)
      if (labelElement) {
        labelElement.setAttribute('for', inputId)
      }
      
      // Handle error state
      if (error) {
        const errorId = `${inputId}-error`
        input.setAttribute('aria-describedby', errorId)
        input.setAttribute('aria-invalid', 'true')
        
        // Create or update error element
        let errorElement = document.getElementById(errorId)
        if (!errorElement) {
          errorElement = document.createElement('div')
          errorElement.id = errorId
          errorElement.setAttribute('role', 'alert')
          errorElement.setAttribute('aria-live', 'polite')
          input.parentNode?.appendChild(errorElement)
        }
        errorElement.textContent = error
      } else {
        input.removeAttribute('aria-invalid')
        const errorId = `${inputId}-error`
        const errorElement = document.getElementById(errorId)
        if (errorElement) {
          errorElement.remove()
        }
      }
      
      // Handle description
      if (description) {
        const descId = `${inputId}-description`
        input.setAttribute('aria-describedby', descId)
        
        let descElement = document.getElementById(descId)
        if (!descElement) {
          descElement = document.createElement('div')
          descElement.id = descId
          input.parentNode?.appendChild(descElement)
        }
        descElement.textContent = description
      }
    }
  }
}