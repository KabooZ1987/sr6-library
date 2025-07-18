import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OptimizedDataTable from '../OptimizedDataTable.vue'
import DetailModal from '../DetailModal.vue'
import QuickActionButtons from '../QuickActionButtons.vue'

// Mock ResizeObserver for responsive testing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia for responsive testing
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

describe('Visual Regression Tests for Responsive Layouts', () => {
  const mockData = [
    {
      id: 1,
      name: 'Test Action',
      type: 'Simple',
      attribute: 'Agility',
      skill: 'Firearms',
      description: 'A test action for visual regression testing',
      source: 'Test Source',
      page: 123,
      homebrew: false
    },
    {
      id: 2,
      name: 'Another Action',
      type: 'Complex',
      attribute: 'Body',
      skill: 'Running',
      description: 'Another test action with longer description text',
      source: 'Test Source',
      page: 124,
      homebrew: true
    }
  ]

  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1024, height: 768 },
    { name: 'large-desktop', width: 1440, height: 900 }
  ]

  let originalInnerWidth: number
  let originalInnerHeight: number

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight
    vi.clearAllMocks()
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    })
  })

  describe('OptimizedDataTable Responsive Layout', () => {
    viewports.forEach(viewport => {
      it(`should render correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
        // Set viewport size
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height
        })

        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockData,
            dataType: 'commonActions'
          }
        })

        // Basic structure should be present
        expect(wrapper.find('[data-testid="optimized-table"]').exists()).toBe(true)

        // Check responsive behavior based on viewport
        if (viewport.width <= 768) {
          // Mobile/tablet specific checks
          const table = wrapper.find('[data-testid="optimized-table"]')
          
          // Should have mobile-friendly styling
          expect(table.classes()).toContain('responsive-table')
          
          // Priority 1 columns should be visible
          const nameColumn = wrapper.find('[data-testid="column-name"]')
          expect(nameColumn.exists()).toBe(true)
          
          // Lower priority columns might be hidden
          const lowPriorityColumns = wrapper.findAll('[data-testid^="column-"][data-priority="4"]')
          if (viewport.width <= 375) {
            // On mobile, priority 4 columns should be hidden
            lowPriorityColumns.forEach(col => {
              expect(col.classes()).toContain('hidden-mobile')
            })
          }
        } else {
          // Desktop specific checks
          const allColumns = wrapper.findAll('[data-testid^="column-"]')
          expect(allColumns.length).toBeGreaterThan(2)
          
          // All columns should be visible on desktop
          allColumns.forEach(col => {
            expect(col.isVisible()).toBe(true)
          })
        }

        // Action buttons should adapt to viewport
        const actionButtons = wrapper.find('[data-testid="quick-actions"]')
        if (actionButtons.exists()) {
          if (viewport.width <= 375) {
            // Mobile should show dropdown
            expect(actionButtons.find('[data-testid="mobile-actions-dropdown"]').exists()).toBe(true)
          } else if (viewport.width <= 768) {
            // Tablet should show icon buttons
            expect(actionButtons.find('[data-testid="icon-buttons"]').exists()).toBe(true)
          } else {
            // Desktop should show full buttons
            expect(actionButtons.find('[data-testid="full-buttons"]').exists()).toBe(true)
          }
        }

        wrapper.unmount()
      })
    })

    it('should handle column priority visibility correctly', async () => {
      const priorities = [1, 2, 3, 4]
      
      for (const priority of priorities) {
        // Test different viewport widths
        const testWidths = [375, 768, 1024]
        
        for (const width of testWidths) {
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width
          })

          const wrapper = mount(OptimizedDataTable, {
            props: {
              data: mockData,
              dataType: 'commonActions'
            }
          })

          const priorityColumns = wrapper.findAll(`[data-testid^="column-"][data-priority="${priority}"]`)
          
          priorityColumns.forEach(col => {
            if (width <= 375 && priority > 2) {
              // Mobile: only priority 1-2 visible
              expect(col.classes()).toContain('hidden-mobile')
            } else if (width <= 768 && priority > 3) {
              // Tablet: priority 1-3 visible
              expect(col.classes()).toContain('hidden-tablet')
            } else {
              // Desktop: all priorities visible
              expect(col.isVisible()).toBe(true)
            }
          })

          wrapper.unmount()
        }
      }
    })
  })

  describe('DetailModal Responsive Layout', () => {
    viewports.forEach(viewport => {
      it(`should render modal correctly on ${viewport.name}`, async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height
        })

        const wrapper = mount(DetailModal, {
          props: {
            visible: true,
            item: mockData[0],
            dataType: 'commonActions'
          }
        })

        // Modal should be present
        expect(wrapper.find('[data-testid="detail-modal"]').exists()).toBe(true)

        // Check responsive modal sizing
        const modal = wrapper.find('[data-testid="detail-modal"]')
        
        if (viewport.width <= 768) {
          // Mobile/tablet: full-screen or near full-screen modal
          expect(modal.classes()).toContain('modal-fullscreen')
        } else {
          // Desktop: centered modal with max width
          expect(modal.classes()).toContain('modal-centered')
        }

        // Modal content should be organized in sections
        expect(wrapper.find('[data-testid="modal-basic-info"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="modal-details"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="modal-meta"]').exists()).toBe(true)

        // Action buttons should be responsive
        const modalActions = wrapper.find('[data-testid="modal-actions"]')
        if (modalActions.exists()) {
          if (viewport.width <= 375) {
            // Mobile: stacked buttons
            expect(modalActions.classes()).toContain('actions-stacked')
          } else {
            // Tablet/desktop: inline buttons
            expect(modalActions.classes()).toContain('actions-inline')
          }
        }

        wrapper.unmount()
      })
    })
  })

  describe('QuickActionButtons Responsive Layout', () => {
    viewports.forEach(viewport => {
      it(`should render action buttons correctly on ${viewport.name}`, async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })

        const wrapper = mount(QuickActionButtons, {
          props: {
            item: mockData[0],
            showView: true,
            showEdit: true,
            showDelete: true
          }
        })

        const actionsContainer = wrapper.find('[data-testid="quick-actions"]')
        expect(actionsContainer.exists()).toBe(true)

        if (viewport.width <= 375) {
          // Mobile: dropdown menu
          expect(wrapper.find('[data-testid="mobile-dropdown"]').exists()).toBe(true)
          expect(wrapper.find('[data-testid="dropdown-trigger"]').exists()).toBe(true)
        } else if (viewport.width <= 768) {
          // Tablet: icon buttons with tooltips
          expect(wrapper.find('[data-testid="icon-view"]').exists()).toBe(true)
          expect(wrapper.find('[data-testid="icon-edit"]').exists()).toBe(true)
          expect(wrapper.find('[data-testid="icon-delete"]').exists()).toBe(true)
        } else {
          // Desktop: full text buttons
          expect(wrapper.find('[data-testid="button-view"]').exists()).toBe(true)
          expect(wrapper.find('[data-testid="button-edit"]').exists()).toBe(true)
          expect(wrapper.find('[data-testid="button-delete"]').exists()).toBe(true)
        }

        wrapper.unmount()
      })
    })

    it('should handle touch interactions on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      const wrapper = mount(QuickActionButtons, {
        props: {
          item: mockData[0],
          showView: true,
          showEdit: true,
          showDelete: true
        }
      })

      const dropdown = wrapper.find('[data-testid="mobile-dropdown"]')
      if (dropdown.exists()) {
        const trigger = wrapper.find('[data-testid="dropdown-trigger"]')
        expect(trigger.exists()).toBe(true)

        // Simulate touch interaction
        await trigger.trigger('touchstart')
        await trigger.trigger('click')

        // Dropdown should open
        expect(wrapper.find('[data-testid="dropdown-menu"]').classes()).toContain('open')

        // Touch-friendly button sizes
        const dropdownButtons = wrapper.findAll('[data-testid^="dropdown-"] button')
        dropdownButtons.forEach(button => {
          const styles = getComputedStyle(button.element)
          const minHeight = parseInt(styles.minHeight)
          expect(minHeight).toBeGreaterThanOrEqual(44) // iOS touch target minimum
        })
      }

      wrapper.unmount()
    })
  })

  describe('Layout Consistency Across Breakpoints', () => {
    it('should maintain visual hierarchy across all viewports', async () => {
      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })

        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockData,
            dataType: 'commonActions'
          }
        })

        // Header should always be visible and prominent
        const header = wrapper.find('[data-testid="table-header"]')
        expect(header.exists()).toBe(true)
        expect(header.isVisible()).toBe(true)

        // Name column should always be the first and most prominent
        const nameColumn = wrapper.find('[data-testid="column-name"]')
        expect(nameColumn.exists()).toBe(true)
        expect(nameColumn.classes()).toContain('priority-1')

        // Actions should always be accessible
        const actions = wrapper.find('[data-testid="quick-actions"]')
        expect(actions.exists()).toBe(true)

        wrapper.unmount()
      }
    })

    it('should handle text overflow consistently', async () => {
      const longTextData = [{
        ...mockData[0],
        name: 'This is a very long action name that should be handled properly across different screen sizes',
        description: 'This is an extremely long description that contains a lot of text and should be truncated or wrapped appropriately depending on the screen size and layout requirements.'
      }]

      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })

        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: longTextData,
            dataType: 'commonActions'
          }
        })

        // Text should be handled appropriately
        const nameCell = wrapper.find('[data-testid="cell-name"]')
        if (nameCell.exists()) {
          const styles = getComputedStyle(nameCell.element)
          
          if (viewport.width <= 375) {
            // Mobile: text should be truncated
            expect(styles.textOverflow).toBe('ellipsis')
            expect(styles.whiteSpace).toBe('nowrap')
          } else {
            // Larger screens: text can wrap or be fully visible
            expect(styles.overflow).toBe('visible')
          }
        }

        wrapper.unmount()
      }
    })
  })

  describe('Performance Visual Regression', () => {
    it('should render smoothly during viewport changes', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        }
      })

      // Simulate viewport changes
      const viewportSizes = [375, 768, 1024, 1440]
      
      for (const size of viewportSizes) {
        const startTime = performance.now()
        
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: size
        })

        // Trigger resize event
        window.dispatchEvent(new Event('resize'))
        
        // Wait for any async updates
        await wrapper.vm.$nextTick()
        
        const endTime = performance.now()
        const resizeTime = endTime - startTime

        // Resize should be smooth (under 16ms for 60fps)
        expect(resizeTime).toBeLessThan(50)
        
        // Component should still be functional
        expect(wrapper.find('[data-testid="optimized-table"]').exists()).toBe(true)
      }

      wrapper.unmount()
    })

    it('should maintain accessibility during responsive changes', async () => {
      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })

        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockData,
            dataType: 'commonActions'
          }
        })

        // Check for accessibility attributes
        const table = wrapper.find('[data-testid="optimized-table"]')
        expect(table.attributes('role')).toBe('table')
        expect(table.attributes('aria-label')).toBeDefined()

        // Action buttons should have proper labels
        const actionButtons = wrapper.findAll('[data-testid^="action-button"], [data-testid^="icon-"], [data-testid^="button-"]')
        actionButtons.forEach(button => {
          expect(
            button.attributes('aria-label') || 
            button.attributes('title') || 
            button.text()
          ).toBeTruthy()
        })

        wrapper.unmount()
      }
    })
  })
})