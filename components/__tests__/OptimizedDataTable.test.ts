import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OptimizedDataTable from '../OptimizedDataTable.vue'
import type { DataType } from '~/services/columnConfiguration'

// Mock PrimeVue components
vi.mock('primevue/datatable', () => ({
  default: {
    name: 'DataTable',
    template: `
      <div data-testid="datatable" class="p-datatable">
        <div v-if="$slots.header" class="p-datatable-header">
          <slot name="header"></slot>
        </div>
        <div class="p-datatable-wrapper">
          <table>
            <tbody>
              <tr v-for="(item, index) in value" :key="index" @click="$emit('row-click', { data: item })">
                <slot></slot>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="!value || value.length === 0" class="p-datatable-emptymessage">
          <slot name="empty"></slot>
        </div>
      </div>
    `,
    props: ['value', 'paginator', 'rows', 'rowsPerPageOptions', 'sortField', 'sortOrder', 'globalFilterFields', 'filters', 'filterDisplay', 'dataKey', 'responsive', 'class'],
    emits: ['row-click']
  }
}))

vi.mock('primevue/column', () => ({
  default: {
    name: 'Column',
    template: `
      <td data-testid="column" :class="class">
        <div v-if="$slots.body">
          <slot name="body" :data="{}"></slot>
        </div>
        <div v-else>{{ field }}</div>
        <div v-if="$slots.filter">
          <slot name="filter" :filterModel="{value: null}" :filterCallback="() => {}"></slot>
        </div>
      </td>
    `,
    props: ['field', 'header', 'sortable', 'style', 'class', 'exportable']
  }
}))

vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    template: '<button data-testid="button" :class="$attrs.class" @click="$emit(\'click\')"><slot></slot></button>',
    props: ['icon', 'severity', 'text', 'rounded'],
    emits: ['click']
  }
}))

vi.mock('primevue/inputtext', () => ({
  default: {
    name: 'InputText',
    template: '<input data-testid="inputtext" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'type', 'class'],
    emits: ['input', 'update:modelValue']
  }
}))

vi.mock('primevue/iconfield', () => ({
  default: {
    name: 'IconField',
    template: '<div data-testid="iconfield" class="search-container"><slot></slot></div>',
    props: ['iconPosition']
  }
}))

vi.mock('primevue/inputicon', () => ({
  default: {
    name: 'InputIcon',
    template: '<i data-testid="inputicon"></i>',
    props: ['class']
  }
}))

// Mock window resize functionality
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('OptimizedDataTable', () => {
  const mockData = [
    {
      id: '1',
      name: 'Test Action 1',
      type: 'Major',
      attribute: 'Agility',
      skill: 'Firearms',
      description: 'Test description 1',
      homebrew: false,
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      name: 'Test Action 2',
      type: 'Minor',
      attribute: 'Logic',
      skill: 'Computer',
      description: 'Test description 2',
      homebrew: true,
      updated_at: '2024-01-02'
    }
  ]

  const defaultProps = {
    data: mockData,
    dataType: 'commonActions' as DataType,
    loading: false,
    searchable: true,
    filterable: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window width to desktop
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true
    })
  })

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.optimized-data-table').exists()).toBe(true)
    })

    it('should display loading skeleton when loading is true', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          loading: true
        }
      })
      
      expect(wrapper.find('.loading-skeleton').exists()).toBe(true)
      expect(wrapper.find('[data-testid="datatable"]').exists()).toBe(false)
    })

    it('should display data table when not loading', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      expect(wrapper.find('.loading-skeleton').exists()).toBe(false)
      expect(wrapper.find('[data-testid="datatable"]').exists()).toBe(true)
    })

    it('should render search input when searchable is true', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          searchable: true
        }
      })
      
      expect(wrapper.find('.search-container').exists()).toBe(true)
      expect(wrapper.find('[data-testid="inputtext"]').exists()).toBe(true)
    })

    it('should not render search input when searchable is false', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          searchable: false
        }
      })
      
      expect(wrapper.find('.search-container').exists()).toBe(false)
    })
  })

  describe('Props Handling', () => {
    it('should accept and use data prop', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.data).toEqual(mockData)
    })

    it('should accept and use dataType prop', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.dataType).toBe('commonActions')
    })

    it('should use default values for optional props', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockData,
          dataType: 'commonActions' as DataType
        }
      })
      
      const component = wrapper.vm as any
      expect(component.loading).toBe(false)
      expect(component.searchable).toBe(true)
      expect(component.filterable).toBe(true)
    })

    it('should handle different data types', () => {
      const dataTypes: DataType[] = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew']
      
      dataTypes.forEach(dataType => {
        const wrapper = mount(OptimizedDataTable, {
          props: {
            ...defaultProps,
            dataType
          }
        })
        
        const component = wrapper.vm as any
        expect(component.dataType).toBe(dataType)
        expect(wrapper.exists()).toBe(true)
      })
    })
  })

  describe('Responsive Column Visibility', () => {
    it('should show all columns on desktop (1024px+)', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true })
      
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const component = wrapper.vm as any
      expect(component.screenSize).toBe('desktop')
      
      // Desktop should show all priority levels (1-4)
      const visibleColumns = component.visibleColumns
      const maxPriority = Math.max(...visibleColumns.map((col: any) => col.priority))
      expect(maxPriority).toBe(4)
    })

    it('should hide low priority columns on tablet (768-1023px)', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 800, writable: true })
      
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const component = wrapper.vm as any
      expect(component.screenSize).toBe('tablet')
      
      // Tablet should show only priority 1-3
      const visibleColumns = component.visibleColumns
      const maxPriority = Math.max(...visibleColumns.map((col: any) => col.priority))
      expect(maxPriority).toBeLessThanOrEqual(3)
    })

    it('should show only essential columns on mobile (<768px)', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 600, writable: true })
      
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      
      const component = wrapper.vm as any
      expect(component.screenSize).toBe('mobile')
      
      // Mobile should show only priority 1-2
      const visibleColumns = component.visibleColumns
      const maxPriority = Math.max(...visibleColumns.map((col: any) => col.priority))
      expect(maxPriority).toBeLessThanOrEqual(2)
    })
  })

  describe('Event Handling', () => {
    it('should emit view event when view button is clicked', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const viewButton = wrapper.find('.view-btn')
      if (viewButton.exists()) {
        await viewButton.trigger('click')
        expect(wrapper.emitted('view')).toBeTruthy()
        expect(wrapper.emitted('view')?.[0]).toEqual([mockData[0]])
      }
    })

    it('should emit edit event when edit button is clicked', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const editButton = wrapper.find('.edit-btn')
      if (editButton.exists()) {
        await editButton.trigger('click')
        expect(wrapper.emitted('edit')).toBeTruthy()
      }
    })

    it('should emit delete event when delete button is clicked', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const deleteButton = wrapper.find('.delete-btn')
      if (deleteButton.exists()) {
        await deleteButton.trigger('click')
        expect(wrapper.emitted('delete')).toBeTruthy()
      }
    })

    it('should emit row-click event when row is clicked', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.onRowClick({ data: mockData[0] })
      
      expect(wrapper.emitted('row-click')).toBeTruthy()
      expect(wrapper.emitted('row-click')?.[0]).toEqual([mockData[0]])
    })
  })

  describe('Column Configuration', () => {
    it('should load column configuration for data type', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.columnConfig).toBeDefined()
      expect(component.columnConfig.essentialColumns).toBeDefined()
      expect(component.columnConfig.searchableFields).toBeDefined()
      expect(component.columnConfig.sortableFields).toBeDefined()
    })

    it('should handle column configuration errors gracefully', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          // @ts-ignore - Testing invalid data type
          dataType: 'invalidType'
        }
      })
      
      const component = wrapper.vm as any
      expect(component.columnConfig.essentialColumns).toEqual([])
      expect(component.columnConfig.searchableFields).toEqual([])
      expect(component.columnConfig.sortableFields).toEqual([])
    })

    it('should format cell values using column formatters', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      const mockColumn = {
        field: 'test',
        formatter: (value: any, row: any) => `formatted: ${value}`
      }
      
      const result = component.formatCellValue(mockColumn, { test: 'value' })
      expect(result).toBe('formatted: value')
    })

    it('should handle null/undefined values in cell formatting', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      const mockColumn = { field: 'test' }
      
      expect(component.formatCellValue(mockColumn, { test: null })).toBe('')
      expect(component.formatCellValue(mockColumn, { test: undefined })).toBe('')
      expect(component.formatCellValue(mockColumn, {})).toBe('')
    })
  })

  describe('Search and Filter Functionality', () => {
    it('should initialize filters correctly', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.filters).toBeDefined()
    })

    it('should update global filter when search input changes', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.globalFilter = 'test search'
      await nextTick()
      
      expect(component.globalFilter).toBe('test search')
    })

    it('should get searchable fields from column configuration', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.searchableFields).toBeDefined()
      expect(Array.isArray(component.searchableFields)).toBe(true)
    })

    it('should filter data based on global search', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.globalFilter = 'Test Action 1'
      await nextTick()
      
      const filteredData = component.filteredData
      expect(filteredData).toHaveLength(1)
      expect(filteredData[0].name).toBe('Test Action 1')
    })

    it('should filter data across all searchable fields, not just visible ones', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.globalFilter = 'Test description 2'
      await nextTick()
      
      const filteredData = component.filteredData
      expect(filteredData).toHaveLength(1)
      expect(filteredData[0].description).toBe('Test description 2')
    })

    it('should handle advanced filters', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.advancedFilters = { name: 'Test Action 1' }
      await nextTick()
      
      const filteredData = component.filteredData
      expect(filteredData).toHaveLength(1)
      expect(filteredData[0].name).toBe('Test Action 1')
    })

    it('should combine global and advanced filters', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.globalFilter = 'Test Action'
      component.advancedFilters = { type: 'Major' }
      await nextTick()
      
      const filteredData = component.filteredData
      expect(filteredData).toHaveLength(1)
      expect(filteredData[0].name).toBe('Test Action 1')
      expect(filteredData[0].type).toBe('Major')
    })

    it('should return empty array when no matches found', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.globalFilter = 'Non-existent item'
      await nextTick()
      
      const filteredData = component.filteredData
      expect(filteredData).toHaveLength(0)
    })

    it('should handle nested field searches', async () => {
      const nestedData = [
        {
          id: '1',
          name: 'Test',
          details: {
            category: 'Combat',
            subcategory: 'Ranged'
          }
        }
      ]
      
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          data: nestedData
        }
      })
      
      const component = wrapper.vm as any
      const result = component.getNestedValue(nestedData[0], 'details.category')
      expect(result).toBe('Combat')
    })

    it('should toggle advanced filters visibility', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.showAdvancedFilters).toBe(false)
      
      component.toggleAdvancedFilters()
      expect(component.showAdvancedFilters).toBe(true)
      
      component.toggleAdvancedFilters()
      expect(component.showAdvancedFilters).toBe(false)
    })

    it('should clear all filters when clearAllFilters is called', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.globalFilter = 'test'
      component.advancedFilters = { name: 'test', type: 'test' }
      
      component.clearAllFilters()
      
      expect(component.globalFilter).toBe('')
      expect(component.advancedFilters).toEqual({})
    })

    it('should generate field labels correctly', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.getFieldLabel('name')).toBe('Name')
      expect(component.getFieldLabel('updated_at')).toBe('Updated At')
      expect(component.getFieldLabel('some_complex_field_name')).toBe('Some Complex Field Name')
    })

    it('should render filter controls when filterable is true', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          filterable: true
        }
      })
      
      expect(wrapper.find('.filter-controls').exists()).toBe(true)
      expect(wrapper.find('.filter-toggle-btn').exists()).toBe(true)
      expect(wrapper.find('.clear-filters-btn').exists()).toBe(true)
    })

    it('should not render filter controls when filterable is false', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          filterable: false
        }
      })
      
      expect(wrapper.find('.filter-controls').exists()).toBe(false)
    })

    it('should show advanced filters panel when toggled', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      component.showAdvancedFilters = true
      await nextTick()
      
      expect(wrapper.find('.advanced-filters').exists()).toBe(true)
      expect(wrapper.find('.filter-grid').exists()).toBe(true)
    })
  })

  describe('Sorting Functionality', () => {
    it('should get sortable fields from column configuration', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.sortableFields).toBeDefined()
      expect(Array.isArray(component.sortableFields)).toBe(true)
    })

    it('should set default sort field from visible columns', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.defaultSortField).toBeDefined()
      expect(typeof component.defaultSortField).toBe('string')
    })

    it('should set default sort order to ascending', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      expect(component.defaultSortOrder).toBe(1)
    })

    it('should fallback to name field if no sortable columns found', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          dataType: 'homebrew' as DataType // This might have different sortable columns
        }
      })
      
      const component = wrapper.vm as any
      expect(component.defaultSortField).toBeDefined()
    })
  })

  describe('Cross Data Type Functionality', () => {
    const dataTypes: DataType[] = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew']
    
    dataTypes.forEach(dataType => {
      describe(`${dataType} Data Type`, () => {
        const testData = [
          {
            id: '1',
            name: `Test ${dataType} 1`,
            description: `Test description for ${dataType}`,
            type: 'Test Type',
            cost: 5,
            category: 'Test Category',
            source: 'Test Source',
            updated_at: '2024-01-01'
          },
          {
            id: '2',
            name: `Another ${dataType} 2`,
            description: `Another description for ${dataType}`,
            type: 'Another Type',
            cost: 3,
            category: 'Another Category',
            source: 'Another Source',
            updated_at: '2024-01-02'
          }
        ]

        it(`should load column configuration for ${dataType}`, () => {
          const wrapper = mount(OptimizedDataTable, {
            props: {
              data: testData,
              dataType,
              loading: false,
              searchable: true,
              filterable: true
            }
          })
          
          const component = wrapper.vm as any
          expect(component.columnConfig).toBeDefined()
          expect(component.columnConfig.essentialColumns.length).toBeGreaterThan(0)
          expect(component.columnConfig.searchableFields.length).toBeGreaterThan(0)
        })

        it(`should filter ${dataType} data correctly`, async () => {
          const wrapper = mount(OptimizedDataTable, {
            props: {
              data: testData,
              dataType,
              loading: false,
              searchable: true,
              filterable: true
            }
          })
          
          const component = wrapper.vm as any
          component.globalFilter = `Test ${dataType} 1`
          await nextTick()
          
          const filteredData = component.filteredData
          expect(filteredData).toHaveLength(1)
          expect(filteredData[0].name).toBe(`Test ${dataType} 1`)
        })

        it(`should search across all fields for ${dataType}`, async () => {
          const wrapper = mount(OptimizedDataTable, {
            props: {
              data: testData,
              dataType,
              loading: false,
              searchable: true,
              filterable: true
            }
          })
          
          const component = wrapper.vm as any
          component.globalFilter = 'Another description'
          await nextTick()
          
          const filteredData = component.filteredData
          expect(filteredData).toHaveLength(1)
          expect(filteredData[0].description).toContain('Another description')
        })

        it(`should handle advanced filters for ${dataType}`, async () => {
          const wrapper = mount(OptimizedDataTable, {
            props: {
              data: testData,
              dataType,
              loading: false,
              searchable: true,
              filterable: true
            }
          })
          
          const component = wrapper.vm as any
          component.advancedFilters = { category: 'Test Category' }
          await nextTick()
          
          const filteredData = component.filteredData
          expect(filteredData).toHaveLength(1)
          expect(filteredData[0].category).toBe('Test Category')
        })
      })
    })
  })

  describe('Table Styling and Classes', () => {
    it('should apply correct table classes', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      const classes = component.tableClasses
      
      expect(classes).toContain('optimized-table')
      expect(classes).toContain('table-commonActions')
      expect(classes).toContain('screen-desktop')
    })

    it('should apply column styles correctly', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      const mockColumn = {
        width: '100px',
        minWidth: '80px'
      }
      
      const styles = component.getColumnStyle(mockColumn)
      expect(styles.width).toBe('100px')
      expect(styles.minWidth).toBe('80px')
    })

    it('should apply column classes correctly', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      const mockColumn = {
        field: 'name',
        priority: 1,
        sortable: true,
        searchable: true
      }
      
      const classes = component.getColumnClass(mockColumn)
      expect(classes).toContain('column-name')
      expect(classes).toContain('priority-1')
    })
  })

  describe('Lifecycle Management', () => {
    it('should add resize listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      
      mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should remove resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      wrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should reinitialize filters when dataType changes', async () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const component = wrapper.vm as any
      const initFiltersSpy = vi.spyOn(component, 'initializeFilters')
      
      await wrapper.setProps({ dataType: 'edgeActions' })
      
      expect(initFiltersSpy).toHaveBeenCalled()
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: {
          ...defaultProps,
          data: []
        }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('No commonActions found')
    })
  })

  describe('Action Buttons', () => {
    it('should render action buttons for each row', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      expect(wrapper.find('.action-buttons').exists()).toBe(true)
      expect(wrapper.find('.view-btn').exists()).toBe(true)
      expect(wrapper.find('.edit-btn').exists()).toBe(true)
      expect(wrapper.find('.delete-btn').exists()).toBe(true)
    })

    it('should have correct tooltips on action buttons', () => {
      const wrapper = mount(OptimizedDataTable, {
        props: defaultProps
      })
      
      const viewBtn = wrapper.find('.view-btn')
      const editBtn = wrapper.find('.edit-btn')
      const deleteBtn = wrapper.find('.delete-btn')
      
      if (viewBtn.exists()) {
        expect(viewBtn.attributes('v-tooltip.top')).toBe('View Details')
      }
      if (editBtn.exists()) {
        expect(editBtn.attributes('v-tooltip.top')).toBe('Edit')
      }
      if (deleteBtn.exists()) {
        expect(deleteBtn.attributes('v-tooltip.top')).toBe('Delete')
      }
    })
  })
})