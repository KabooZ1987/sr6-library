import { vi } from 'vitest'
import 'axe-core'

// Mock axe-core for accessibility testing
vi.mock('axe-core', () => ({
  run: vi.fn().mockResolvedValue({
    violations: [],
    passes: [],
    incomplete: [],
    inapplicable: []
  }),
  configure: vi.fn(),
  getRules: vi.fn().mockReturnValue([]),
  reset: vi.fn()
}))

// Mock window APIs for accessibility testing
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockReturnValue({
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    fontSize: '16px',
    fontWeight: 'normal',
    outline: '2px solid blue',
    outlineWidth: '2px',
    boxShadow: 'none',
    display: 'block',
    visibility: 'visible',
    opacity: '1'
  })
})

// Mock screen reader announcements
const mockLiveRegion = document.createElement('div')
mockLiveRegion.id = 'accessibility-live-region'
mockLiveRegion.setAttribute('aria-live', 'polite')
mockLiveRegion.setAttribute('aria-atomic', 'true')
mockLiveRegion.style.position = 'absolute'
mockLiveRegion.style.left = '-10000px'
document.body.appendChild(mockLiveRegion)

// Mock focus management
Element.prototype.focus = vi.fn()
Element.prototype.blur = vi.fn()

// Setup accessibility testing environment
beforeEach(() => {
  document.body.innerHTML = ''
  document.body.appendChild(mockLiveRegion)
})