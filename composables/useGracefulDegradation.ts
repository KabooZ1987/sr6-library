import { ref, computed, onMounted } from 'vue'
import { useErrorService } from '~/services/errorService'

export interface FeatureSupport {
  [key: string]: boolean
}

export interface GracefulDegradationOptions {
  features?: string[]
  fallbackMessage?: string
  enableLogging?: boolean
}

export interface GracefulDegradationReturn {
  isSupported: (feature: string) => boolean
  checkSupport: (feature: string, testFn: () => boolean) => boolean
  withFallback: <T>(feature: string, primaryFn: () => T, fallbackFn: () => T) => T
  getSupportedFeatures: () => string[]
  getUnsupportedFeatures: () => string[]
  hasAnyUnsupportedFeatures: () => boolean
}

export function useGracefulDegradation(options: GracefulDegradationOptions = {}): GracefulDegradationReturn {
  const {
    features = [],
    fallbackMessage = 'This feature is not supported in your browser',
    enableLogging = true
  } = options

  const errorService = useErrorService()
  const featureSupport = ref<FeatureSupport>({})
  const initialized = ref(false)

  // Common feature detection functions
  const featureTests: Record<string, () => boolean> = {
    // Touch support
    touch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Modern JavaScript features
    asyncAwait: () => {
      try {
        eval('(async () => {})')
        return true
      } catch {
        return false
      }
    },
    
    // CSS features
    cssGrid: () => CSS.supports('display', 'grid'),
    cssFlexbox: () => CSS.supports('display', 'flex'),
    cssCustomProperties: () => CSS.supports('--test', 'value'),
    
    // Web APIs
    fetch: () => typeof fetch !== 'undefined',
    localStorage: () => {
      try {
        const test = '__test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    },
    sessionStorage: () => {
      try {
        const test = '__test__'
        sessionStorage.setItem(test, test)
        sessionStorage.removeItem(test)
        return true
      } catch {
        return false
      }
    },
    
    // Intersection Observer
    intersectionObserver: () => 'IntersectionObserver' in window,
    
    // Resize Observer
    resizeObserver: () => 'ResizeObserver' in window,
    
    // Web Workers
    webWorkers: () => typeof Worker !== 'undefined',
    
    // Service Workers
    serviceWorkers: () => 'serviceWorker' in navigator,
    
    // Geolocation
    geolocation: () => 'geolocation' in navigator,
    
    // WebRTC
    webRTC: () => 'RTCPeerConnection' in window,
    
    // WebGL
    webGL: () => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      } catch {
        return false
      }
    },
    
    // Clipboard API
    clipboard: () => 'clipboard' in navigator,
    
    // Notifications
    notifications: () => 'Notification' in window,
    
    // File API
    fileAPI: () => 'File' in window && 'FileReader' in window,
    
    // Drag and Drop
    dragDrop: () => 'draggable' in document.createElement('div'),
    
    // History API
    historyAPI: () => 'pushState' in history,
    
    // WebSockets
    webSockets: () => 'WebSocket' in window,
    
    // IndexedDB
    indexedDB: () => 'indexedDB' in window,
    
    // Canvas
    canvas: () => {
      try {
        const canvas = document.createElement('canvas')
        return !!(canvas.getContext && canvas.getContext('2d'))
      } catch {
        return false
      }
    },
    
    // SVG
    svg: () => {
      try {
        return !!(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)
      } catch {
        return false
      }
    },
    
    // CSS Animations
    cssAnimations: () => CSS.supports('animation', 'test 1s'),
    
    // CSS Transitions
    cssTransitions: () => CSS.supports('transition', 'test 1s'),
    
    // Pointer Events
    pointerEvents: () => 'PointerEvent' in window,
    
    // Passive Event Listeners
    passiveEvents: () => {
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get() {
            return true
          }
        })
        window.addEventListener('test', () => {}, opts)
        window.removeEventListener('test', () => {}, opts)
        return true
      } catch {
        return false
      }
    }
  }

  const checkSupport = (feature: string, testFn?: () => boolean): boolean => {
    try {
      const test = testFn || featureTests[feature]
      if (!test) {
        if (enableLogging) {
          console.warn(`No test function found for feature: ${feature}`)
        }
        return false
      }
      
      const supported = test()
      featureSupport.value[feature] = supported
      
      if (!supported && enableLogging) {
        console.info(`Feature not supported: ${feature}`)
      }
      
      return supported
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      // Log the error but don't throw
      errorService.captureError(err, {
        component: 'graceful-degradation',
        action: 'feature-detection',
        metadata: { feature }
      }, 'low')
      
      featureSupport.value[feature] = false
      return false
    }
  }

  const isSupported = (feature: string): boolean => {
    if (!(feature in featureSupport.value)) {
      return checkSupport(feature)
    }
    return featureSupport.value[feature]
  }

  const withFallback = <T>(feature: string, primaryFn: () => T, fallbackFn: () => T): T => {
    try {
      if (isSupported(feature)) {
        return primaryFn()
      } else {
        if (enableLogging) {
          console.info(`Using fallback for unsupported feature: ${feature}`)
        }
        return fallbackFn()
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      errorService.captureError(err, {
        component: 'graceful-degradation',
        action: 'fallback-execution',
        metadata: { feature }
      }, 'medium')
      
      // Try fallback if primary function fails
      try {
        return fallbackFn()
      } catch (fallbackError) {
        const fallbackErr = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
        
        errorService.captureError(fallbackErr, {
          component: 'graceful-degradation',
          action: 'fallback-failure',
          metadata: { feature }
        }, 'high')
        
        throw fallbackErr
      }
    }
  }

  const getSupportedFeatures = (): string[] => {
    return Object.entries(featureSupport.value)
      .filter(([, supported]) => supported)
      .map(([feature]) => feature)
  }

  const getUnsupportedFeatures = (): string[] => {
    return Object.entries(featureSupport.value)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature)
  }

  const hasAnyUnsupportedFeatures = (): boolean => {
    return getUnsupportedFeatures().length > 0
  }

  // Initialize feature detection
  onMounted(() => {
    if (process.client && !initialized.value) {
      // Check all requested features
      features.forEach(feature => {
        checkSupport(feature)
      })
      
      // Check common features by default
      const commonFeatures = ['fetch', 'localStorage', 'cssFlexbox', 'touch']
      commonFeatures.forEach(feature => {
        if (!features.includes(feature)) {
          checkSupport(feature)
        }
      })
      
      initialized.value = true
    }
  })

  return {
    isSupported,
    checkSupport,
    withFallback,
    getSupportedFeatures,
    getUnsupportedFeatures,
    hasAnyUnsupportedFeatures
  }
}

// Convenience composable for common feature checks
export function useFeatureDetection() {
  const degradation = useGracefulDegradation()
  
  return {
    ...degradation,
    
    // Common feature checks
    hasTouch: computed(() => degradation.isSupported('touch')),
    hasFetch: computed(() => degradation.isSupported('fetch')),
    hasLocalStorage: computed(() => degradation.isSupported('localStorage')),
    hasFlexbox: computed(() => degradation.isSupported('cssFlexbox')),
    hasGrid: computed(() => degradation.isSupported('cssGrid')),
    hasIntersectionObserver: computed(() => degradation.isSupported('intersectionObserver')),
    hasClipboard: computed(() => degradation.isSupported('clipboard')),
    
    // Device type detection
    isMobile: computed(() => {
      if (typeof window === 'undefined') return false
      return degradation.isSupported('touch') && window.innerWidth <= 768
    }),
    isDesktop: computed(() => {
      if (typeof window === 'undefined') return true
      return !degradation.isSupported('touch') || window.innerWidth > 768
    })
  }
}