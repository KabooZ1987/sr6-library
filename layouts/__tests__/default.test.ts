import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DefaultLayout from '../default.vue'

// Mock Vue Router composables
const mockUseRoute = vi.fn()
const mockUseRouter = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => mockUseRoute(),
  useRouter: () => mockUseRouter()
}))

// Mock window object for resize and scroll events
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200
})

Object.defineProperty(window, 'scrollY', {
  writable: true,
  configurable: true,
  value: 0
})

const createWrapper = (routePath = '/') => {
  // Mock useRoute to return the specified path
  mockUseRoute.mockReturnValue({
    path: routePath,
    name: 'test',
    params: {},
    query: {},
    hash: '',
    fullPath: routePath,
    matched: [],
    meta: {},
    redirectedFrom: undefined
  })
  
  mockUseRouter.mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  })
  
  return mount(DefaultLayout, {
    global: {
      stubs: {
        NavigationLink: {
          name: 'NavigationLink',
          template: '<a v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></a>',
          props: ['to', 'exact', 'activeClass', 'ariaLabel', 'role'],
          emits: ['click']
        },
        ColorModeButton: {
          name: 'ColorModeButton',
          template: '<button>Color Mode</button>'
        }
      }
    },
    slots: {
      default: '<div>Page Content</div>'
    }
  })
}

describe('Default Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window dimensions
    window.innerWidth = 1200
    window.scrollY = 0
  })

  describe('Desktop Navigation', () => {
    it('renders desktop navigation when screen is wide', () => {
      const wrapper = createWrapper()
      
      // Desktop navigation should be visible
      const desktopNav = wrapper.find('.navigation')
      expect(desktopNav.exists()).toBe(true)
      
      // Mobile toggle should not be visible
      const mobileToggle = wrapper.find('.mobile-nav-toggle')
      expect(mobileToggle.exists()).toBe(true)
      expect(mobileToggle.isVisible()).toBe(false)
    })

    it('renders all navigation links', () => {
      const wrapper = createWrapper()
      
      const navLinks = wrapper.findAllComponents({ name: 'NavigationLink' })
      expect(navLinks.length).toBeGreaterThan(0)
      
      // Check for specific navigation items
      const linkTexts = navLinks.map(link => link.text())
      expect(linkTexts).toContain('Home')
      expect(linkTexts).toContain('Actions')
      expect(linkTexts).toContain('Edge boosts')
      expect(linkTexts).toContain('Edge actions')
      expect(linkTexts).toContain('Rules')
      expect(linkTexts).toContain('Homebrew')
    })

    it('applies proper accessibility attributes', () => {
      const wrapper = createWrapper()
      
      const header = wrapper.find('header')
      expect(header.attributes('role')).toBe('banner')
      
      const nav = wrapper.find('nav')
      expect(nav.attributes('role')).toBe('navigation')
      expect(nav.attributes('aria-label')).toBe('Main navigation')
      
      const menubar = wrapper.find('[role="menubar"]')
      expect(menubar.exists()).toBe(true)
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      // Set mobile screen size
      window.innerWidth = 800
    })

    it('shows mobile toggle button on small screens', async () => {
      const wrapper = createWrapper()
      
      // Trigger screen size check
      await wrapper.vm.checkScreenSize()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.Tablet).toBe(true)
      
      const mobileToggle = wrapper.find('.mobile-nav-toggle')
      expect(mobileToggle.exists()).toBe(true)
    })

    it('toggles mobile navigation menu', async () => {
      const wrapper = createWrapper()
      
      // Set mobile mode
      await wrapper.vm.checkScreenSize()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.vm.mobileNavOpen).toBe(false)
      
      // Toggle mobile nav
      await wrapper.vm.toggleMobileNav()
      expect(wrapper.vm.mobileNavOpen).toBe(true)
      
      // Toggle again
      await wrapper.vm.toggleMobileNav()
      expect(wrapper.vm.mobileNavOpen).toBe(false)
    })

    it('closes mobile navigation when navigation link is clicked', async () => {
      const wrapper = createWrapper()
      
      // Set mobile mode and open nav
      await wrapper.vm.checkScreenSize()
      wrapper.vm.mobileNavOpen = true
      await wrapper.vm.$nextTick()
      
      // Click a navigation link
      await wrapper.vm.closeMobileNav()
      expect(wrapper.vm.mobileNavOpen).toBe(false)
    })

    it('has proper accessibility attributes for mobile toggle', async () => {
      const wrapper = createWrapper()
      
      // Set mobile mode
      await wrapper.vm.checkScreenSize()
      await wrapper.vm.$nextTick()
      
      const mobileToggle = wrapper.find('.mobile-nav-toggle')
      expect(mobileToggle.attributes('aria-expanded')).toBe('false')
      expect(mobileToggle.attributes('aria-controls')).toBe('mobile-navigation')
      expect(mobileToggle.attributes('aria-label')).toBe('Toggle mobile navigation menu')
      expect(mobileToggle.attributes('type')).toBe('button')
    })
  })

  describe('Keyboard Navigation', () => {
    it('closes mobile navigation on Escape key', async () => {
      const wrapper = createWrapper()
      
      // Set mobile mode and open nav
      wrapper.vm.mobileNavOpen = true
      await wrapper.vm.$nextTick()
      
      // Simulate Escape key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      await wrapper.vm.handleKeydown(escapeEvent)
      
      expect(wrapper.vm.mobileNavOpen).toBe(false)
    })

    it('ignores other keys when mobile nav is closed', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.mobileNavOpen = false
      
      // Simulate other key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      await wrapper.vm.handleKeydown(enterEvent)
      
      expect(wrapper.vm.mobileNavOpen).toBe(false)
    })
  })

  describe('Scroll Behavior', () => {
    it('updates scroll state based on scroll position', async () => {
      const wrapper = createWrapper()
      
      expect(wrapper.vm.scrollNav).toBe(false)
      
      // Simulate scroll
      window.scrollY = 100
      await wrapper.vm.updateScroll()
      
      expect(wrapper.vm.scrollNav).toBe(true)
      
      // Scroll back to top
      window.scrollY = 0
      await wrapper.vm.updateScroll()
      
      expect(wrapper.vm.scrollNav).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('switches to desktop mode when screen is resized', async () => {
      const wrapper = createWrapper()
      
      // Start in mobile mode
      window.innerWidth = 800
      await wrapper.vm.checkScreenSize()
      expect(wrapper.vm.Tablet).toBe(true)
      
      // Resize to desktop
      window.innerWidth = 1200
      await wrapper.vm.checkScreenSize()
      expect(wrapper.vm.Tablet).toBe(false)
      expect(wrapper.vm.mobileNavOpen).toBe(false)
    })
  })
})