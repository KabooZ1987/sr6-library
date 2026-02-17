import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useGracefulDegradation, useFeatureDetection } from '../useGracefulDegradation'

// Mock DOM APIs
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  innerWidth: 1024,
  Worker: function() {},
  RTCPeerConnection: function() {},
  WebSocket: function() {},
  Notification: function() {}
}

const mockNavigator = {
  maxTouchPoints: 0,
  serviceWorker: {},
  geolocation: {},
  clipboard: {}
}

const mockDocument = {
  createElement: vi.fn(() => ({
    getContext: vi.fn(() => ({})),
    createSVGRect: vi.fn()
  })),
  createElementNS: vi.fn(() => ({
    createSVGRect: vi.fn()
  }))
}

const mockCSS = {
  supports: vi.fn(() => true)
}

const mockLocalStorage = {
  setItem: vi.fn(),
  removeItem: vi.fn(),
  getItem: vi.fn(),
  clear: vi.fn()
}

const mockSessionStorage = {
  setItem: vi.fn(),
  removeItem: vi.fn(),
  getItem: vi.fn(),
  clear: vi.fn()
}

// Setup global mocks
vi.stubGlobal('window', {
  ...mockWindow,
  location: { href: 'http://localhost:3000' }
})
vi.stubGlobal('navigator', mockNavigator)
vi.stubGlobal('document', mockDocument)
vi.stubGlobal('CSS', mockCSS)
vi.stubGlobal('localStorage', mockLocalStorage)
vi.stubGlobal('sessionStorage', mockSessionStorage)
vi.stubGlobal('fetch', vi.fn())
vi.stubGlobal('process', { client: true })

describe('useGracefulDegradation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('feature detection', () => {
    it('should detect touch support correctly', () => {
      const { checkSupport } = useGracefulDegradation()
      
      // Mock touch support
      mockWindow.ontouchstart = true
      mockNavigator.maxTouchPoints = 1
      
      const hasTouch = checkSupport('touch')
      expect(hasTouch).toBe(true)
    })

    it('should detect fetch support correctly', () => {
      const { checkSupport } = useGracefulDegradation()
      
      const hasFetch = checkSupport('fetch')
      expect(hasFetch).toBe(true)
    })

    it('should detect localStorage support correctly', () => {
      const { checkSupport } = useGracefulDegradation()
      
      const hasLocalStorage = checkSupport('localStorage')
      expect(hasLocalStorage).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('__test__', '__test__')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('__test__')
    })

    it('should handle localStorage errors gracefully', () => {
      const { checkSupport } = useGracefulDegradation()
      
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const hasLocalStorage = checkSupport('localStorage')
      expect(hasLocalStorage).toBe(false)
    })

    it('should detect CSS features correctly', () => {
      const { checkSupport } = useGracefulDegradation()
      
      mockCSS.supports.mockReturnValue(true)
      
      const hasGrid = checkSupport('cssGrid')
      expect(hasGrid).toBe(true)
      expect(mockCSS.supports).toHaveBeenCalledWith('display', 'grid')
    })

    it('should use custom test functions', () => {
      const { checkSupport } = useGracefulDegradation()
      
      const customTest = vi.fn(() => true)
      const result = checkSupport('customFeature', customTest)
      
      expect(result).toBe(true)
      expect(customTest).toHaveBeenCalled()
    })

    it('should handle test function errors gracefully', () => {
      const { checkSupport } = useGracefulDegradation()
      
      const failingTest = vi.fn(() => {
        throw new Error('Test failed')
      })
      
      const result = checkSupport('failingFeature', failingTest)
      expect(result).toBe(false)
    })
  })

  describe('isSupported', () => {
    it('should return cached results', () => {
      const { isSupported, checkSupport } = useGracefulDegradation()
      
      // First check should call the test function
      checkSupport('fetch')
      
      // Second check should use cached result
      const result1 = isSupported('fetch')
      const result2 = isSupported('fetch')
      
      expect(result1).toBe(result2)
    })

    it('should check support if not cached', () => {
      const { isSupported } = useGracefulDegradation()
      
      const result = isSupported('fetch')
      expect(result).toBe(true)
    })
  })

  describe('withFallback', () => {
    it('should use primary function when feature is supported', () => {
      const { withFallback } = useGracefulDegradation()
      
      const primaryFn = vi.fn(() => 'primary')
      const fallbackFn = vi.fn(() => 'fallback')
      
      const result = withFallback('fetch', primaryFn, fallbackFn)
      
      expect(result).toBe('primary')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).not.toHaveBeenCalled()
    })

    it('should use fallback function when feature is not supported', () => {
      const { withFallback, checkSupport } = useGracefulDegradation()
      
      // Mock feature as unsupported
      checkSupport('unsupportedFeature', () => false)
      
      const primaryFn = vi.fn(() => 'primary')
      const fallbackFn = vi.fn(() => 'fallback')
      
      const result = withFallback('unsupportedFeature', primaryFn, fallbackFn)
      
      expect(result).toBe('fallback')
      expect(primaryFn).not.toHaveBeenCalled()
      expect(fallbackFn).toHaveBeenCalled()
    })

    it('should use fallback when primary function throws', () => {
      const { withFallback } = useGracefulDegradation()
      
      const primaryFn = vi.fn(() => {
        throw new Error('Primary failed')
      })
      const fallbackFn = vi.fn(() => 'fallback')
      
      const result = withFallback('fetch', primaryFn, fallbackFn)
      
      expect(result).toBe('fallback')
      expect(primaryFn).toHaveBeenCalled()
      expect(fallbackFn).toHaveBeenCalled()
    })

    it('should throw if both primary and fallback fail', () => {
      const { withFallback } = useGracefulDegradation()
      
      const primaryFn = vi.fn(() => {
        throw new Error('Primary failed')
      })
      const fallbackFn = vi.fn(() => {
        throw new Error('Fallback failed')
      })
      
      expect(() => {
        withFallback('fetch', primaryFn, fallbackFn)
      }).toThrow('Fallback failed')
    })
  })

  describe('feature management', () => {
    it('should return supported features', () => {
      const { getSupportedFeatures, checkSupport } = useGracefulDegradation()
      
      checkSupport('fetch', () => true)
      checkSupport('localStorage', () => true)
      checkSupport('webGL', () => false)
      
      const supported = getSupportedFeatures()
      expect(supported).toContain('fetch')
      expect(supported).toContain('localStorage')
      expect(supported).not.toContain('webGL')
    })

    it('should return unsupported features', () => {
      const { getUnsupportedFeatures, checkSupport } = useGracefulDegradation()
      
      checkSupport('fetch', () => true)
      checkSupport('webGL', () => false)
      checkSupport('webRTC', () => false)
      
      const unsupported = getUnsupportedFeatures()
      expect(unsupported).toContain('webGL')
      expect(unsupported).toContain('webRTC')
      expect(unsupported).not.toContain('fetch')
    })

    it('should detect if any features are unsupported', () => {
      const { hasAnyUnsupportedFeatures, checkSupport } = useGracefulDegradation()
      
      checkSupport('fetch', () => true)
      checkSupport('localStorage', () => true)
      
      expect(hasAnyUnsupportedFeatures()).toBe(false)
      
      checkSupport('webGL', () => false)
      
      expect(hasAnyUnsupportedFeatures()).toBe(true)
    })
  })
})

describe('useFeatureDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should provide computed properties for common features', () => {
    const detection = useFeatureDetection()
    
    expect(detection.hasTouch).toBeDefined()
    expect(detection.hasFetch).toBeDefined()
    expect(detection.hasLocalStorage).toBeDefined()
    expect(detection.hasFlexbox).toBeDefined()
    expect(detection.hasGrid).toBeDefined()
  })

  it('should detect mobile vs desktop correctly', () => {
    // Test desktop detection
    const desktopWindow = {
      ...mockWindow,
      innerWidth: 1024,
      location: { href: 'http://localhost:3000' }
    }
    delete (desktopWindow as any).ontouchstart
    vi.stubGlobal('window', desktopWindow)
    mockNavigator.maxTouchPoints = 0
    
    const desktopDetection = useFeatureDetection()
    
    expect(desktopDetection.isDesktop.value).toBe(true)
    expect(desktopDetection.isMobile.value).toBe(false)
    
    // Test mobile detection
    const mobileWindow = {
      ...mockWindow,
      innerWidth: 375,
      ontouchstart: true,
      location: { href: 'http://localhost:3000' }
    }
    vi.stubGlobal('window', mobileWindow)
    mockNavigator.maxTouchPoints = 1
    
    const mobileDetection = useFeatureDetection()
    
    expect(mobileDetection.isMobile.value).toBe(true)
  })

  it('should include all graceful degradation methods', () => {
    const detection = useFeatureDetection()
    
    expect(detection.isSupported).toBeDefined()
    expect(detection.checkSupport).toBeDefined()
    expect(detection.withFallback).toBeDefined()
    expect(detection.getSupportedFeatures).toBeDefined()
    expect(detection.getUnsupportedFeatures).toBeDefined()
    expect(detection.hasAnyUnsupportedFeatures).toBeDefined()
  })
})