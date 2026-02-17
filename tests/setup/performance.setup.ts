import { vi } from 'vitest'

// Mock performance APIs
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn().mockReturnValue([]),
    getEntriesByType: vi.fn().mockReturnValue([]),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    timing: {
      navigationStart: Date.now() - 1000,
      loadEventEnd: Date.now()
    }
  }
})

// Mock requestAnimationFrame for performance testing
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16) // ~60fps
  return 1
})

global.cancelAnimationFrame = vi.fn()

// Mock requestIdleCallback
global.requestIdleCallback = vi.fn((callback) => {
  setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 1)
  return 1
})

global.cancelIdleCallback = vi.fn()

// Performance testing utilities
global.measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const start = performance.now()
  const result = fn()
  
  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now()
      return { name, duration: end - start }
    })
  } else {
    const end = performance.now()
    return { name, duration: end - start }
  }
}