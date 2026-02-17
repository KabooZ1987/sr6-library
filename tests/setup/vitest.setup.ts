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
if (typeof process !== 'undefined') {
  (process as any).client = true;
  (process as any).server = false;
} else {
  Object.defineProperty(global, 'process', {
    value: {
      client: true,
      server: false,
      env: {
        NODE_ENV: 'test'
      }
    }
  })
}

// Mock common Nuxt composables
const mockUseAsyncData = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    data: { value: [] },
    pending: { value: false },
    refresh: vi.fn()
  });
});
const mockFetch = vi.fn().mockResolvedValue([]);
const mockUseHead = vi.fn();
const mockUseRuntimeConfig = vi.fn(() => ({ public: {} }));

// Define on multiple possible global objects
[global, globalThis, window].forEach((obj: any) => {
  try {
    Object.defineProperty(obj, 'useAsyncData', {
      value: mockUseAsyncData,
      writable: true,
      configurable: true
    });
    Object.defineProperty(obj, '$fetch', {
      value: mockFetch,
      writable: true,
      configurable: true
    });
    Object.defineProperty(obj, 'useHead', {
      value: mockUseHead,
      writable: true,
      configurable: true
    });
    Object.defineProperty(obj, 'useRuntimeConfig', {
      value: mockUseRuntimeConfig,
      writable: true,
      configurable: true
    });
  } catch (e) {
    // Ignore if already defined and not configurable
  }
});

vi.stubGlobal('useAsyncData', mockUseAsyncData);
vi.stubGlobal('$fetch', mockFetch);
vi.stubGlobal('useHead', mockUseHead);
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig);

// Mock Element.focus and blur methods
Element.prototype.focus = vi.fn()
Element.prototype.blur = vi.fn()

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Setup DOM environment
beforeEach(() => {
  document.body.innerHTML = ''
})