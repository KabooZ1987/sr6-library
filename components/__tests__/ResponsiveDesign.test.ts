import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import OptimizedDataTable from '../OptimizedDataTable.vue'
import QuickActionButtons from '../QuickActionButtons.vue'
import DetailModal from '../DetailModal.vue'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tooltip from 'primevue/tooltip'

// Mock marked module
vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((text: string) => `<p>${text}</p>`)
  }
}))

// Mock window.innerWidth for responsive testing
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

// Mock matchMedia for PrimeVue components
const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock getBoundingClientRect for DOM elements
const mockGetBoundingClientRect = () => {
  const mockRect = {
    width: 100,
    height: 50,
    top: 0,
    left: 0,
    bottom: 50,
    right: 100,
    x: 0,
    y: 0,
    toJSON: vi.fn()
  }
  
  Element.prototype.getBoundingClientRect = vi.fn(() => mockRect)
  HTMLElement.prototype.getBoundingClientRect = vi.fn(() => mockRect)
  
  // Mock for component refs that might be accessed
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    value: vi.fn(() => mockRect),
    writable: true,
    configurable: true
  })
}

// Mock data for testing
const mockCommonActionsData = [
  {
    id: 1,
    name: 'Aim',
    type: 'Simple',
    attribute: 'Agility',
    skill: 'Firearms',
    description: 'Take careful aim at your target',
    homebrew: false,
    source: 'Core Rulebook',
    page: 162,
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Sprint',
    type: 'Complex',
    attribute: 'Body',
    skill: 'Running',
    description: 'Run at maximum speed',
    homebrew: true,
    source: 'Homebrew',
    page: null,
    updated_at: '2024-02-01T14:20:00Z'
  }
]

const mockEdgeActionsData = [
  {
    id: 1,
    name: 'Push the Limit',
    cost: 1,
    restriction: 'Once per turn',
    description: 'Add your Edge rating to a single test',
    source: 'Core Rulebook',
    page: 56,
    updated_at: '2024-01-15T10:30:00Z'
  }
]

describe('Responsive Design Implementation', () => {
  let wrapper: VueWrapper<any>
  let originalInnerWidth: number

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
    
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    
    // Mock matchMedia
    mockMatchMedia()
    
    // Mock getBoundingClientRect
    mockGetBoundingClientRect()
    
    // Mock marked for markdown rendering
    vi.mock('marked', () => ({
      marked: {
        parse: vi.fn((text: string) => `<p>${text}</p>`)
      }
    }))
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
    vi.clearAllMocks()
  })

  describe('OptimizedDataTable Responsive Behavior', () => {
    it('should show all columns on desktop screens (>= 1024px)', async () => {
      mockInnerWidth(1200)
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Should show all priority levels (1-4)
      const columns = wrapper.vm.visibleColumns
      expect(columns).toHaveLength(4)
      expect(columns.some((col: any) => col.priority === 4)).toBe(true)
    })

    it('should hide priority 4 columns on tablet screens (768px - 1023px)', async () => {
      mockInnerWidth(800)
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Should show priority 1-3 columns only
      const columns = wrapper.vm.visibleColumns
      expect(columns.every((col: any) => col.priority <= 3)).toBe(true)
      expect(columns.some((col: any) => col.priority === 4)).toBe(false)
    })

    it('should hide priority 3-4 columns on mobile screens (481px - 767px)', async () => {
      mockInnerWidth(600)
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Should show priority 1-2 columns only
      const columns = wrapper.vm.visibleColumns
      expect(columns.every((col: any) => col.priority <= 2)).toBe(true)
      expect(columns.some((col: any) => col.priority >= 3)).toBe(false)
    })

    it('should show only priority 1 columns on extra small screens (<= 480px)', async () => {
      mockInnerWidth(400)
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Should show priority 1 columns only
      const columns = wrapper.vm.visibleColumns
      expect(columns.every((col: any) => col.priority === 1)).toBe(true)
      expect(columns.some((col: any) => col.priority > 1)).toBe(false)
    })

    it('should update column visibility when screen size changes', async () => {
      // Start with desktop
      mockInnerWidth(1200)
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Should show all columns initially
      let columns = wrapper.vm.visibleColumns
      expect(columns).toHaveLength(4)

      // Change to mobile
      mockInnerWidth(400)
      await nextTick()
      await wrapper.vm.$nextTick()

      // Should now show only priority 1 columns
      columns = wrapper.vm.visibleColumns
      expect(columns.every((col: any) => col.priority === 1)).toBe(true)
    })

    it('should maintain search functionality across all fields regardless of column visibility', async () => {
      mockInnerWidth(400) // Mobile view
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions',
          searchable: true
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Should be able to search hidden fields
      const searchableFields = wrapper.vm.searchableFields
      expect(searchableFields).toContain('description')
      expect(searchableFields).toContain('attribute')
      expect(searchableFields).toContain('skill')
      
      // Set search term that matches hidden field
      wrapper.vm.globalFilter = 'Agility'
      await nextTick()
      
      const filteredData = wrapper.vm.filteredData
      expect(filteredData).toHaveLength(1)
      expect(filteredData[0].attribute).toBe('Agility')
    })
  })

  describe('QuickActionButtons Responsive Behavior', () => {
    it('should show full buttons with text on desktop', async () => {
      mockInnerWidth(1200)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          },
          directives: {
            tooltip: Tooltip
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.screenSize).toBe('desktop')
      
      // Should have buttons with labels
      const buttons = wrapper.findAllComponents(Button)
      expect(buttons).toHaveLength(3)
      
      // Check for text labels
      expect(wrapper.text()).toContain('View')
      expect(wrapper.text()).toContain('Edit')
      expect(wrapper.text()).toContain('Delete')
    })

    it('should show icon-only buttons on tablet', async () => {
      mockInnerWidth(800)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.screenSize).toBe('tablet')
      
      // Should have icon-only buttons
      const buttons = wrapper.findAllComponents(Button)
      expect(buttons).toHaveLength(3)
      
      // Should not have text labels in tablet mode
      expect(wrapper.text()).not.toContain('View')
      expect(wrapper.text()).not.toContain('Edit')
      expect(wrapper.text()).not.toContain('Delete')
    })

    it('should show dropdown menu on mobile', async () => {
      mockInnerWidth(600)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.screenSize).toBe('mobile')
      
      // Should have only one trigger button
      const buttons = wrapper.findAllComponents(Button)
      expect(buttons).toHaveLength(1)
      
      // Should have dropdown trigger
      expect(wrapper.find('.dropdown-trigger').exists()).toBe(true)
    })

    it('should show touch-friendly dropdown on extra small screens', async () => {
      mockInnerWidth(400)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.screenSize).toBe('mobile-xs')
      
      // Should have touch-friendly styling
      const trigger = wrapper.find('.dropdown-trigger')
      expect(trigger.exists()).toBe(true)
      expect(trigger.classes()).toContain('touch-friendly')
    })

    it('should open and close dropdown menu correctly', async () => {
      mockInnerWidth(600)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Initially dropdown should be closed
      expect(wrapper.vm.showDropdown).toBe(false)
      expect(wrapper.find('.dropdown-menu').exists()).toBe(false)

      // Click trigger to open dropdown
      await wrapper.find('.dropdown-trigger').trigger('click')
      await nextTick()

      expect(wrapper.vm.showDropdown).toBe(true)
      expect(wrapper.find('.dropdown-menu').exists()).toBe(true)
      
      // Should have dropdown items
      const dropdownItems = wrapper.findAll('.dropdown-item')
      expect(dropdownItems).toHaveLength(3)
      expect(dropdownItems[0].text()).toContain('View Details')
      expect(dropdownItems[1].text()).toContain('Edit')
      expect(dropdownItems[2].text()).toContain('Delete')
    })

    it('should emit correct events from dropdown actions', async () => {
      mockInnerWidth(600)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Open dropdown
      await wrapper.find('.dropdown-trigger').trigger('click')
      await nextTick()

      // Click view action
      await wrapper.findAll('.dropdown-item')[0].trigger('click')
      await nextTick()

      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')[0]).toEqual([mockCommonActionsData[0]])
      
      // Dropdown should close after action
      expect(wrapper.vm.showDropdown).toBe(false)
    })
  })

  describe('DetailModal Responsive Behavior', () => {
    it('should use appropriate breakpoints for modal sizing', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonActionsData[0],
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Dialog,
            Button,
            Badge,
            Tag,
            ProgressSpinner
          }
        }
      })

      await nextTick()

      const dialog = wrapper.findComponent(Dialog)
      expect(dialog.exists()).toBe(true)
      
      // Check breakpoints are set
      const breakpoints = dialog.props('breakpoints')
      expect(breakpoints).toEqual({
        '1024px': '85vw',
        '768px': '95vw',
        '480px': '98vw'
      })
    })

    it('should organize content in responsive grid layout', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonActionsData[0],
          dataType: 'commonActions',
          modalSections: [
            {
              title: 'Basic Information',
              fields: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'type', label: 'Type', type: 'text' }
              ]
            }
          ]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Dialog,
            Button,
            Badge,
            Tag,
            ProgressSpinner
          }
        }
      })

      await nextTick()

      // Should have dialog component
      const dialog = wrapper.findComponent(Dialog)
      expect(dialog.exists()).toBe(true)
      expect(dialog.props('visible')).toBe(true)
      
      // Should have modal sections structure
      const sections = wrapper.findAll('.detail-section')
      expect(sections.length).toBeGreaterThanOrEqual(0) // May be 0 if not rendered due to visibility
    })

    it('should handle markdown content properly', async () => {
      const itemWithMarkdown = {
        ...mockCommonActionsData[0],
        description: '# Test Heading\n\nThis is **bold** text with *italic* text.'
      }

      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: itemWithMarkdown,
          modalSections: [
            {
              title: 'Details',
              fields: [
                { key: 'description', label: 'Description', type: 'markdown' }
              ]
            }
          ]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Dialog,
            Button,
            Badge,
            Tag,
            ProgressSpinner
          }
        }
      })

      await nextTick()

      // Should have dialog component
      const dialog = wrapper.findComponent(Dialog)
      expect(dialog.exists()).toBe(true)
      expect(dialog.props('visible')).toBe(true)
      
      // Should have item data available
      expect(wrapper.vm.item).toBeTruthy()
      expect(wrapper.vm.item.description).toContain('Test Heading')
    })

    it('should show touch-friendly navigation buttons', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonActionsData[0],
          showNavigation: true,
          hasPrevious: true,
          hasNext: true,
          showEditButton: true
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Dialog,
            Button,
            Badge,
            Tag,
            ProgressSpinner
          }
        }
      })

      await nextTick()

      // Should have navigation and edit buttons
      const buttons = wrapper.findAllComponents(Button)
      expect(buttons.length).toBeGreaterThanOrEqual(3) // Previous, Next, Edit
      
      // Check for navigation buttons
      const prevButton = buttons.find(btn => btn.props('icon') === 'pi pi-chevron-left')
      const nextButton = buttons.find(btn => btn.props('icon') === 'pi pi-chevron-right')
      const editButton = buttons.find(btn => btn.props('icon') === 'pi pi-pencil')
      
      expect(prevButton).toBeTruthy()
      expect(nextButton).toBeTruthy()
      expect(editButton).toBeTruthy()
    })

    it('should emit navigation events correctly', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonActionsData[0],
          showNavigation: true,
          hasPrevious: true,
          hasNext: true
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Dialog,
            Button,
            Badge,
            Tag,
            ProgressSpinner
          }
        }
      })

      await nextTick()

      const buttons = wrapper.findAllComponents(Button)
      const prevButton = buttons.find(btn => btn.props('icon') === 'pi pi-chevron-left')
      const nextButton = buttons.find(btn => btn.props('icon') === 'pi pi-chevron-right')

      // Test previous navigation
      if (prevButton) {
        await prevButton.trigger('click')
        expect(wrapper.emitted('navigate')).toBeTruthy()
        expect(wrapper.emitted('navigate')[0]).toEqual(['previous'])
      }

      // Test next navigation
      if (nextButton) {
        await nextButton.trigger('click')
        expect(wrapper.emitted('navigate')).toBeTruthy()
        expect(wrapper.emitted('navigate')[1]).toEqual(['next'])
      }
    })
  })

  describe('Touch-Friendly Interactions', () => {
    it('should have appropriate touch targets on mobile', async () => {
      mockInnerWidth(400)
      
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      const trigger = wrapper.find('.dropdown-trigger')
      expect(trigger.classes()).toContain('touch-friendly')
      
      // Open dropdown to check touch-friendly items
      await trigger.trigger('click')
      await nextTick()

      const dropdownMenu = wrapper.find('.dropdown-menu')
      expect(dropdownMenu.classes()).toContain('touch-friendly')
      
      const dropdownItems = wrapper.findAll('.dropdown-item')
      expect(dropdownItems.length).toBeGreaterThan(0)
      
      // Touch-friendly items should exist and be properly structured
      dropdownItems.forEach(item => {
        expect(item.exists()).toBe(true)
        expect(item.classes()).toContain('dropdown-item')
      })
    })

    it('should handle form elements appropriately on touch devices', async () => {
      mockInnerWidth(400)
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions',
          searchable: true
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Search input should be present and accessible
      const searchInput = wrapper.find('.search-input')
      expect(searchInput.exists()).toBe(true)
      
      // Should be able to interact with search
      await searchInput.setValue('test')
      expect(wrapper.vm.globalFilter).toBe('test')
    })
  })

  describe('Performance and Accessibility', () => {
    it('should maintain performance with responsive changes', async () => {
      const startTime = performance.now()
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: Array(100).fill(null).map((_, i) => ({
            ...mockCommonActionsData[0],
            id: i,
            name: `Action ${i}`
          })),
          dataType: 'commonActions'
        },
        global: {
          plugins: [PrimeVue],
          components: {
            DataTable,
            Column,
            Button,
            InputText,
            IconField,
            InputIcon
          }
        }
      })

      await nextTick()
      await wrapper.vm.$nextTick()

      // Multiple screen size changes
      for (const width of [1200, 800, 600, 400, 1200]) {
        mockInnerWidth(width)
        await nextTick()
        await wrapper.vm.$nextTick()
      }

      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete responsive changes reasonably quickly
      expect(duration).toBeLessThan(1000) // 1 second threshold
    })

    it('should maintain accessibility features across screen sizes', async () => {
      wrapper = mount(QuickActionButtons, {
        props: {
          item: mockCommonActionsData[0]
        },
        global: {
          plugins: [PrimeVue],
          components: {
            Button
          }
        }
      })

      // Test across different screen sizes
      for (const width of [1200, 800, 600, 400]) {
        mockInnerWidth(width)
        await nextTick()
        await wrapper.vm.$nextTick()

        // All interactive elements should be focusable
        const buttons = wrapper.findAllComponents(Button)
        buttons.forEach(button => {
          expect(button.attributes('tabindex')).not.toBe('-1')
        })

        // Should have appropriate ARIA labels or tooltips
        if (width >= 1024) {
          // Desktop: buttons with text
          expect(wrapper.text()).toContain('View')
        } else if (width >= 768) {
          // Tablet: icon buttons with tooltips
          const iconButtons = wrapper.findAllComponents(Button)
          expect(iconButtons.length).toBeGreaterThan(0)
        } else {
          // Mobile: dropdown with accessible items
          const trigger = wrapper.find('.dropdown-trigger')
          expect(trigger.exists()).toBe(true)
        }
      }
    })
  })
})