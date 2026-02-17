import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window dimensions
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock process.client and NODE_ENV
Object.defineProperty(global, 'process', {
  value: {
    client: true,
    server: false,
    env: {
      NODE_ENV: 'test'
    }
  }
})

// Mock Element.focus and blur methods
Element.prototype.focus = vi.fn()
Element.prototype.blur = vi.fn()

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Setup DOM environment
beforeEach(() => {
  document.body.innerHTML = ''
})