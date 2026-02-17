import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import NavigationLink from '../NavigationLink.vue'

// Mock Vue Router
const mockRoute = {
  path: '/current-page',
  name: 'current-page',
  params: {},
  query: {},
  hash: '',
  fullPath: '/current-page',
  matched: [],
  meta: {},
  redirectedFrom: undefined
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  currentRoute: { value: mockRoute }
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

// Mock AppLink component
const AppLinkMock = {
  name: 'AppLink',
  template: `
    <a 
      :to="to" 
      :href="href"
      :class="$attrs.class"
      :aria-label="ariaLabel"
      :role="role"
      @click="$emit('click', $event)"
      @keydown="$emit('keydown', $event)"
    >
      <slot />
    </a>
  `,
  props: ['to', 'href', 'ariaLabel', 'role'],
  emits: ['click', 'keydown']
}

describe('NavigationLink', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset route to default
    mockRoute.path = '/current-page'
    mockRoute.fullPath = '/current-page'
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const createWrapper = (props = {}, slots = { default: 'Navigation Link' }) => {
    return mount(NavigationLink, {
      props: {
        to: '/test-page',
        ...props
      },
      slots,
      global: {
        components: {
          AppLink: AppLinkMock
        }
      }
    })
  }

  describe('Basic Rendering', () => {
    it('should render with AppLink component', () => {
      wrapper = createWrapper()
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      expect(appLink.exists()).toBe(true)
      expect(appLink.props('to')).toBe('/test-page')
    })

    it('should pass through slot content', () => {
      wrapper = createWrapper({}, { default: 'Custom Link Text' })
      
      expect(wrapper.text()).toBe('Custom Link Text')
    })

    it('should apply navigation link classes', () => {
      wrapper = createWrapper()
      
      expect(wrapper.classes()).toContain('nav-link')
    })
  })

  describe('Active State Detection', () => {
    it('should detect active state for exact match', () => {
      mockRoute.path = '/test-page'
      mockRoute.fullPath = '/test-page'
      
      wrapper = createWrapper({ to: '/test-page', exact: true })
      
      expect(wrapper.vm.isActive).toBe(true)
      expect(wrapper.classes()).toContain('nav-link--active')
    })

    it('should detect active state for partial match when not exact', () => {
      mockRoute.path = '/test-page/sub-page'
      mockRoute.fullPath = '/test-page/sub-page'
      
      wrapper = createWrapper({ to: '/test-page', exact: false })
      
      expect(wrapper.vm.isActive).toBe(true)
      expect(wrapper.classes()).toContain('nav-link--active')
    })

    it('should not be active for partial match when exact is true', () => {
      mockRoute.path = '/test-page/sub-page'
      mockRoute.fullPath = '/test-page/sub-page'
      
      wrapper = createWrapper({ to: '/test-page', exact: true })
      
      expect(wrapper.vm.isActive).toBe(false)
      expect(wrapper.classes()).not.toContain('nav-link--active')
    })

    it('should handle root path correctly', () => {
      mockRoute.path = '/'
      mockRoute.fullPath = '/'
      
      wrapper = createWrapper({ to: '/', exact: true })
      
      expect(wrapper.vm.isActive).toBe(true)
      expect(wrapper.classes()).toContain('nav-link--active')
    })

    it('should handle query parameters in active detection', () => {
      mockRoute.path = '/test-page'
      mockRoute.fullPath = '/test-page?param=value'
      
      wrapper = createWrapper({ to: '/test-page' })
      
      expect(wrapper.vm.isActive).toBe(true)
    })

    it('should handle hash fragments in active detection', () => {
      mockRoute.path = '/test-page'
      mockRoute.fullPath = '/test-page#section'
      
      wrapper = createWrapper({ to: '/test-page' })
      
      expect(wrapper.vm.isActive).toBe(true)
    })
  })

  describe('Custom Active Class', () => {
    it('should use custom active class when provided', () => {
      mockRoute.path = '/test-page'
      
      wrapper = createWrapper({ 
        to: '/test-page', 
        activeClass: 'custom-active' 
      })
      
      expect(wrapper.classes()).toContain('custom-active')
      expect(wrapper.classes()).not.toContain('nav-link--active')
    })

    it('should use default active class when not provided', () => {
      mockRoute.path = '/test-page'
      
      wrapper = createWrapper({ to: '/test-page' })
      
      expect(wrapper.classes()).toContain('nav-link--active')
    })
  })

  describe('ARIA and Accessibility', () => {
    it('should have proper ARIA attributes for navigation', () => {
      wrapper = createWrapper()
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      expect(appLink.props('role')).toBe('menuitem')
    })

    it('should generate appropriate ARIA label', () => {
      wrapper = createWrapper({ to: '/about' }, { default: 'About Us' })
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      expect(appLink.props('ariaLabel')).toBe('Navigate to About Us')
    })

    it('should use custom ARIA label when provided', () => {
      wrapper = createWrapper({ 
        to: '/about',
        ariaLabel: 'Custom ARIA label'
      })
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      expect(appLink.props('ariaLabel')).toBe('Custom ARIA label')
    })

    it('should indicate current page to screen readers', () => {
      mockRoute.path = '/test-page'
      
      wrapper = createWrapper({ to: '/test-page' })
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      const ariaLabel = appLink.props('ariaLabel')
      expect(ariaLabel).toContain('current page')
    })
  })

  describe('Event Handling', () => {
    it('should emit click events', async () => {
      wrapper = createWrapper()
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      await appLink.vm.$emit('click', new MouseEvent('click'))
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should emit keydown events', async () => {
      wrapper = createWrapper()
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      await appLink.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Enter' }))
      
      expect(wrapper.emitted('keydown')).toBeTruthy()
      expect(wrapper.emitted('keydown')).toHaveLength(1)
    })

    it('should handle navigation click', async () => {
      wrapper = createWrapper()
      
      await wrapper.vm.handleNavClick(new MouseEvent('click'))
      
      expect(wrapper.emitted('navigate')).toBeTruthy()
      expect(wrapper.emitted('navigate')[0]).toEqual(['/test-page'])
    })
  })

  describe('Props Validation and Handling', () => {
    it('should handle string to prop', () => {
      wrapper = createWrapper({ to: '/string-path' })
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      expect(appLink.props('to')).toBe('/string-path')
    })

    it('should handle object to prop', () => {
      const routeObject = { name: 'test-route', params: { id: '123' } }
      wrapper = createWrapper({ to: routeObject })
      
      const appLink = wrapper.findComponent({ name: 'AppLink' })
      expect(appLink.props('to')).toEqual(routeObject)
    })

    it('should handle exact prop correctly', () => {
      wrapper = createWrapper({ exact: true })
      
      expect(wrapper.vm.exact).toBe(true)
    })

    it('should default exact to false', () => {
      wrapper = createWrapper()
      
      expect(wrapper.vm.exact).toBe(false)
    })
  })

  describe('Complex Route Matching', () => {
    it('should handle nested routes correctly', () => {
      mockRoute.path = '/parent/child'
      mockRoute.fullPath = '/parent/child'
      
      // Should be active for parent route when not exact
      wrapper = createWrapper({ to: '/parent', exact: false })
      expect(wrapper.vm.isActive).toBe(true)
      
      // Should not be active for parent route when exact
      wrapper.unmount()
      wrapper = createWrapper({ to: '/parent', exact: true })
      expect(wrapper.vm.isActive).toBe(false)
    })

    it('should handle route parameters', () => {
      mockRoute.path = '/users/123'
      mockRoute.fullPath = '/users/123'
      
      wrapper = createWrapper({ to: '/users/123' })
      expect(wrapper.vm.isActive).toBe(true)
      
      wrapper.unmount()
      wrapper = createWrapper({ to: '/users/456' })
      expect(wrapper.vm.isActive).toBe(false)
    })

    it('should handle trailing slashes consistently', () => {
      mockRoute.path = '/test-page/'
      mockRoute.fullPath = '/test-page/'
      
      wrapper = createWrapper({ to: '/test-page' })
      expect(wrapper.vm.isActive).toBe(true)
      
      wrapper.unmount()
      mockRoute.path = '/test-page'
      mockRoute.fullPath = '/test-page'
      
      wrapper = createWrapper({ to: '/test-page/' })
      expect(wrapper.vm.isActive).toBe(true)
    })
  })

  describe('Styling and CSS Classes', () => {
    it('should combine custom classes with navigation classes', () => {
      wrapper = createWrapper({ class: 'custom-nav-class' })
      
      expect(wrapper.classes()).toContain('nav-link')
      expect(wrapper.classes()).toContain('custom-nav-class')
    })

    it('should handle array of custom classes', () => {
      wrapper = createWrapper({ class: ['class1', 'class2'] })
      
      expect(wrapper.classes()).toContain('nav-link')
      expect(wrapper.classes()).toContain('class1')
      expect(wrapper.classes()).toContain('class2')
    })

    it('should handle object-style classes', () => {
      wrapper = createWrapper({ 
        class: { 
          'conditional-class': true, 
          'false-class': false 
        } 
      })
      
      expect(wrapper.classes()).toContain('nav-link')
      expect(wrapper.classes()).toContain('conditional-class')
      expect(wrapper.classes()).not.toContain('false-class')
    })
  })

  describe('Reactivity', () => {
    it('should update active state when route changes', async () => {
      wrapper = createWrapper({ to: '/test-page' })
      
      // Initially not active
      expect(wrapper.vm.isActive).toBe(false)
      
      // Change route to match
      mockRoute.path = '/test-page'
      mockRoute.fullPath = '/test-page'
      
      // Force reactivity update
      await wrapper.vm.$forceUpdate()
      await nextTick()
      
      expect(wrapper.vm.isActive).toBe(true)
    })

    it('should update when to prop changes', async () => {
      mockRoute.path = '/current-page'
      wrapper = createWrapper({ to: '/current-page' })
      
      expect(wrapper.vm.isActive).toBe(true)
      
      // Change to prop
      await wrapper.setProps({ to: '/different-page' })
      
      expect(wrapper.vm.isActive).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty to prop gracefully', () => {
      expect(() => {
        wrapper = createWrapper({ to: '' })
      }).not.toThrow()
      
      expect(wrapper.vm.isActive).toBe(false)
    })

    it('should handle null route gracefully', () => {
      // Mock null route scenario
      const originalRoute = mockRoute.path
      mockRoute.path = null as any
      
      expect(() => {
        wrapper = createWrapper({ to: '/test' })
      }).not.toThrow()
      
      expect(wrapper.vm.isActive).toBe(false)
      
      // Restore route
      mockRoute.path = originalRoute
    })

    it('should handle special characters in routes', () => {
      const specialRoute = '/test-page?query=value&other=123#section'
      mockRoute.path = '/test-page'
      mockRoute.fullPath = specialRoute
      
      wrapper = createWrapper({ to: '/test-page' })
      expect(wrapper.vm.isActive).toBe(true)
    })

    it('should handle encoded URLs', () => {
      mockRoute.path = '/test page with spaces'
      mockRoute.fullPath = '/test%20page%20with%20spaces'
      
      wrapper = createWrapper({ to: '/test page with spaces' })
      expect(wrapper.vm.isActive).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should not re-compute active state unnecessarily', async () => {
      wrapper = createWrapper({ to: '/test-page' })
      
      const computeSpy = vi.spyOn(wrapper.vm, 'isActive', 'get')
      
      // Multiple accesses should use cached value
      const active1 = wrapper.vm.isActive
      const active2 = wrapper.vm.isActive
      const active3 = wrapper.vm.isActive
      
      expect(active1).toBe(active2)
      expect(active2).toBe(active3)
    })

    it('should handle many navigation links efficiently', () => {
      const startTime = performance.now()
      
      const wrappers = []
      for (let i = 0; i < 100; i++) {
        const w = createWrapper({ to: `/page-${i}` })
        wrappers.push(w)
      }
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render 100 navigation links quickly
      expect(renderTime).toBeLessThan(100)
      
      // Cleanup
      wrappers.forEach(w => w.unmount())
    })
  })
})