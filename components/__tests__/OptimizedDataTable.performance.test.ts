import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import OptimizedDataTable from '../OptimizedDataTable.vue'
import { columnConfigurationService } from '~/services/columnConfiguration'

// Mock PrimeVue components
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: vi.fn()
  })
}))

vi.mock('~/services/toastService', () => ({
  useToastService: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  })
}))

// Mock column configuration service
vi.mock('~/services/columnConfiguration', () => ({
  columnConfigurationService: {
    getColumnConfig: vi.fn(() => ({
      essentialColumns: [
        { field: 'name', header: 'Name', sortable: true, searchable: true, priority: 1 },
        { field: 'type', header: 'Type', sortable: true, searchable: true, priority: 2 },
        { field: 'cost', header: 'Cost', sortable: true, searchable: true, priority: 3 }
      ],
      searchableFields: ['name', 'type', 'cost', 'description'],
      sortableFields: ['name', 'type', 'cost']
    }))
  }
}))

// Mock window.innerWidth for responsive tests
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
})

const mockData = [
  { id: 1, name: 'Test Item 1', type: 'Type A', cost: 5, description: 'Test description 1' },
  { id: 2, name: 'Test Item 2', type: 'Type B', cost: 3, description: 'Test description 2' },
  { id: 3, name: 'Test Item 3', type: 'Type A', cost: 7, description: 'Test description 3' }
]

describe('OptimizedDataTable - Performance Optimizations and Error Handling', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Loading States and Skeleton Loading', () => {
    it('should display skeleton loading when loading prop is true', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(wrapper.find('.loading-container').exists()).toBe(true)
      expect(wrapper.find('.loading-skeleton').exists()).toBe(true)
      expect(wrapper.find('.skeleton-row').exists()).toBe(true)
      expect(wrapper.find('.skeleton-cell').exists()).toBe(true)
    })

    it('should display correct number of skeleton rows based on screen size', async () => {
      // Test desktop
      window.innerWidth = 1024
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      await nextTick()
      const skeletonRows = wrapper.findAll('.skeleton-row')
      expect(skeletonRows.length).toBe(6) // Desktop shows 6 rows

      // Test mobile
      window.innerWidth = 480
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      // Remount to test mobile skeleton
      wrapper.unmount()
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      await nextTick()
      const mobileSkeletonRows = wrapper.findAll('.skeleton-row')
      expect(mobileSkeletonRows.length).toBe(3) // Mobile shows 3 rows
    })

    it('should hide skeleton loading when loading is false', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions',
          loading: false
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(wrapper.find('.loading-container').exists()).toBe(false)
      expect(wrapper.find('.loading-skeleton').exists()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should wrap content in ErrorBoundary component', () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(wrapper.findComponent({ name: 'ErrorBoundary' }).exists()).toBe(true)
    })

    it('should emit retry event when handleRetry is called', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      const component = wrapper.vm
      await component.handleRetry()

      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(wrapper.emitted('retry')).toHaveLength(1)
    })

    it('should handle view action errors gracefully', async () => {
      const mockToastService = {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn()
      }

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          },
          provide: {
            toastService: mockToastService
          }
        }
      })

      const component = wrapper.vm
      const testItem = mockData[0]

      // Test successful view
      await component.handleView(testItem)
      expect(wrapper.emitted('view')).toBeTruthy()
      expect(wrapper.emitted('view')[0]).toEqual([testItem])
    })
  })

  describe('Confirmation Dialogs', () => {
    it('should include ConfirmationDialog component', () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(wrapper.findComponent({ name: 'ConfirmationDialog' }).exists()).toBe(true)
    })

    it('should call confirmation dialog for delete actions', async () => {
      const mockConfirm = {
        require: vi.fn()
      }

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          },
          provide: {
            confirm: mockConfirm
          }
        }
      })

      const component = wrapper.vm
      const testItem = mockData[0]

      await component.handleDelete(testItem)

      expect(mockConfirm.require).toHaveBeenCalledWith(
        expect.objectContaining({
          group: 'table-actions',
          message: expect.stringContaining('Test Item 1'),
          header: 'Confirm Deletion',
          severity: 'danger'
        })
      )
    })
  })

  describe('Toast Notifications', () => {
    it('should include Toast component', () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(wrapper.findComponent({ name: 'Toast' }).exists()).toBe(true)
    })
  })

  describe('Responsive Skeleton Loading', () => {
    it('should adapt skeleton loading for mobile screens', async () => {
      // Set mobile screen size
      window.innerWidth = 480
      
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()

      const loadingContainer = wrapper.find('.loading-container')
      expect(loadingContainer.exists()).toBe(true)
      
      // Check that mobile-specific skeleton elements exist
      const skeletonSearch = wrapper.find('.skeleton-search')
      expect(skeletonSearch.exists()).toBe(true)
      
      const skeletonButtons = wrapper.find('.skeleton-buttons')
      expect(skeletonButtons.exists()).toBe(true)
    })

    it('should show appropriate number of skeleton columns based on screen size', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      // Desktop should show up to 4 columns (3 data + 1 actions)
      const headerCells = wrapper.findAll('.skeleton-header-cell')
      expect(headerCells.length).toBeLessThanOrEqual(4)
      
      const cells = wrapper.findAll('.skeleton-cell')
      expect(cells.length).toBeGreaterThan(0)
    })
  })

  describe('Performance Optimizations', () => {
    it('should initialize column configuration efficiently', () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(columnConfigurationService.getColumnConfig).toHaveBeenCalledWith('commonActions')
      expect(columnConfigurationService.getColumnConfig).toHaveBeenCalledTimes(1)
    })

    it('should handle screen size changes efficiently', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      const component = wrapper.vm

      // Test different screen sizes
      window.innerWidth = 1200
      component.updateScreenSize()
      expect(component.screenSize).toBe('desktop')

      window.innerWidth = 800
      component.updateScreenSize()
      expect(component.screenSize).toBe('tablet')

      window.innerWidth = 600
      component.updateScreenSize()
      expect(component.screenSize).toBe('mobile')

      window.innerWidth = 400
      component.updateScreenSize()
      expect(component.screenSize).toBe('mobile-xs')
    })

    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('Error Recovery', () => {
    it('should handle column configuration errors gracefully', () => {
      // Mock column service to throw error
      vi.mocked(columnConfigurationService.getColumnConfig).mockImplementationOnce(() => {
        throw new Error('Configuration error')
      })

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      // Component should still render with fallback configuration
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle missing data gracefully', () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: null as any,
          dataType: 'commonActions'
        },
        global: {
          stubs: {
            DataTable: true,
            Button: true,
            InputText: true,
            IconField: true,
            InputIcon: true,
            ErrorBoundary: true,
            ConfirmationDialog: true,
            Toast: true
          }
        }
      })

      expect(wrapper.exists()).toBe(true)
      // Should handle null data without crashing
    })
  })
})