import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OptimizedDataTable from '../OptimizedDataTable.vue'
import { ColumnConfigurationService } from '~/services/columnConfiguration'

// Mock data for different page types
const mockDataSets = {
  commonActions: [
    {
      id: 1,
      name: 'Aim',
      type: 'Simple',
      attribute: 'Agility',
      skill: 'Firearms',
      description: 'Take careful aim',
      source: 'Core Rulebook',
      page: 162,
      homebrew: false
    }
  ],
  edgeActions: [
    {
      id: 1,
      name: 'Push the Limit',
      edgeCost: 1,
      type: 'Free',
      restriction: 'Once per turn',
      description: 'Add Edge rating to test',
      source: 'Core Rulebook',
      page: 56
    }
  ],
  edgeBoosts: [
    {
      id: 1,
      name: 'Adrenaline Boost',
      cost: 2,
      effect: 'Increase Initiative',
      applicability: 'Combat',
      description: 'Boost your initiative',
      source: 'Core Rulebook',
      page: 58
    }
  ],
  rules: [
    {
      id: 1,
      name: 'Matrix Actions',
      category: 'Matrix',
      complexity: 'Complex',
      description: 'Rules for matrix actions',
      source: 'Core Rulebook',
      page: 200
    }
  ],
  homebrew: [
    {
      id: 1,
      name: 'Custom Action',
      type: 'Simple',
      author: 'Test User',
      description: 'Custom homebrew action',
      created: '2024-01-01',
      homebrew: true
    }
  ]
}

describe('Cross-Page Consistency End-to-End Tests', () => {
  let columnService: ColumnConfigurationService

  beforeEach(() => {
    columnService = new ColumnConfigurationService()
    vi.clearAllMocks()
  })

  describe('Column Configuration Consistency', () => {
    it('should use consistent column priorities across all data types', () => {
      const dataTypes = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew'] as const

      dataTypes.forEach(dataType => {
        const config = columnService.getColumnConfiguration(dataType)
        
        // Every data type should have priority 1 columns (always visible)
        const priority1Columns = config.essentialColumns.filter(col => col.priority === 1)
        expect(priority1Columns.length).toBeGreaterThan(0)
        
        // Priority should be between 1-4
        config.essentialColumns.forEach(col => {
          expect(col.priority).toBeGreaterThanOrEqual(1)
          expect(col.priority).toBeLessThanOrEqual(4)
        })
      })
    })

    it('should maintain consistent column structure across data types', () => {
      const dataTypes = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew'] as const

      dataTypes.forEach(dataType => {
        const config = columnService.getColumnConfiguration(dataType)
        
        // All configurations should have required properties
        expect(config.essentialColumns).toBeDefined()
        expect(config.searchableFields).toBeDefined()
        expect(config.sortableFields).toBeDefined()
        
        // Essential columns should have required properties
        config.essentialColumns.forEach(col => {
          expect(col.field).toBeDefined()
          expect(col.header).toBeDefined()
          expect(typeof col.sortable).toBe('boolean')
          expect(typeof col.priority).toBe('number')
        })
      })
    })
  })

  describe('Component Behavior Consistency', () => {
    it('should render consistently across all data types', async () => {
      const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

      for (const dataType of dataTypes) {
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockDataSets[dataType],
            dataType: dataType
          }
        })

        // All tables should have consistent base structure
        expect(wrapper.find('[data-testid="optimized-table"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="table-header"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="table-body"]').exists()).toBe(true)

        // All tables should have action buttons
        expect(wrapper.find('[data-testid^="view-button"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid^="edit-button"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid^="delete-button"]').exists()).toBe(true)

        wrapper.unmount()
      }
    })

    it('should handle search consistently across data types', async () => {
      const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

      for (const dataType of dataTypes) {
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockDataSets[dataType],
            dataType: dataType,
            searchable: true
          }
        })

        const searchInput = wrapper.find('[data-testid="search-input"]')
        if (searchInput.exists()) {
          await searchInput.setValue('test search')
          await searchInput.trigger('input')

          // All data types should emit search events consistently
          expect(wrapper.emitted('search')).toBeTruthy()
          expect(wrapper.emitted('search')[0][0]).toBe('test search')
        }

        wrapper.unmount()
      }
    })

    it('should handle actions consistently across data types', async () => {
      const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

      for (const dataType of dataTypes) {
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockDataSets[dataType],
            dataType: dataType
          }
        })

        // Test view action
        const viewButton = wrapper.find('[data-testid="view-button-1"]')
        if (viewButton.exists()) {
          await viewButton.trigger('click')
          expect(wrapper.emitted('view-item')).toBeTruthy()
        }

        // Test edit action
        const editButton = wrapper.find('[data-testid="edit-button-1"]')
        if (editButton.exists()) {
          await editButton.trigger('click')
          expect(wrapper.emitted('edit-item')).toBeTruthy()
        }

        // Test delete action
        const deleteButton = wrapper.find('[data-testid="delete-button-1"]')
        if (deleteButton.exists()) {
          await deleteButton.trigger('click')
          expect(wrapper.emitted('delete-item')).toBeTruthy()
        }

        wrapper.unmount()
      }
    })
  })

  describe('Responsive Behavior Consistency', () => {
    const viewports = [
      { name: 'mobile', width: 375 },
      { name: 'tablet', width: 768 },
      { name: 'desktop', width: 1024 }
    ]

    viewports.forEach(viewport => {
      it(`should behave consistently on ${viewport.name} across all data types`, async () => {
        // Mock viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width
        })

        const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

        for (const dataType of dataTypes) {
          const wrapper = mount(OptimizedDataTable, {
            props: {
              data: mockDataSets[dataType],
              dataType: dataType
            }
          })

          // All data types should have consistent responsive behavior
          const table = wrapper.find('[data-testid="optimized-table"]')
          expect(table.exists()).toBe(true)

          // Check for responsive classes or behavior
          if (viewport.width <= 768) {
            // Mobile/tablet specific checks
            const mobileActions = wrapper.find('[data-testid="mobile-actions-dropdown"]')
            if (mobileActions.exists()) {
              expect(mobileActions.isVisible()).toBe(true)
            }
          } else {
            // Desktop specific checks
            const desktopActions = wrapper.findAll('[data-testid^="action-button"]')
            expect(desktopActions.length).toBeGreaterThan(0)
          }

          wrapper.unmount()
        }
      })
    })
  })

  describe('Error Handling Consistency', () => {
    it('should handle empty data consistently across data types', async () => {
      const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

      for (const dataType of dataTypes) {
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: [],
            dataType: dataType
          }
        })

        // All data types should show consistent empty state
        expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('No data available')

        wrapper.unmount()
      }
    })

    it('should handle loading states consistently', async () => {
      const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

      for (const dataType of dataTypes) {
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: [],
            dataType: dataType,
            loading: true
          }
        })

        // All data types should show consistent loading state
        expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true)

        wrapper.unmount()
      }
    })
  })

  describe('Data Type Specific Consistency', () => {
    it('should display appropriate columns for each data type', () => {
      // Common Actions should show name, type, attribute/skill
      const commonActionsConfig = columnService.getColumnConfiguration('commonActions')
      const commonActionsFields = commonActionsConfig.essentialColumns.map(col => col.field)
      expect(commonActionsFields).toContain('name')
      expect(commonActionsFields.some(field => field.includes('type'))).toBe(true)

      // Edge Actions should show name, edge cost, type
      const edgeActionsConfig = columnService.getColumnConfiguration('edgeActions')
      const edgeActionsFields = edgeActionsConfig.essentialColumns.map(col => col.field)
      expect(edgeActionsFields).toContain('name')
      expect(edgeActionsFields.some(field => field.includes('cost') || field.includes('edge'))).toBe(true)

      // Edge Boosts should show name, cost, effect
      const edgeBoostsConfig = columnService.getColumnConfiguration('edgeBoosts')
      const edgeBoostsFields = edgeBoostsConfig.essentialColumns.map(col => col.field)
      expect(edgeBoostsFields).toContain('name')
      expect(edgeBoostsFields.some(field => field.includes('cost') || field.includes('effect'))).toBe(true)
    })

    it('should maintain search functionality across all data types', () => {
      const dataTypes = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew'] as const

      dataTypes.forEach(dataType => {
        const config = columnService.getColumnConfiguration(dataType)
        
        // All data types should have searchable fields
        expect(config.searchableFields.length).toBeGreaterThan(0)
        
        // Name should always be searchable
        expect(config.searchableFields).toContain('name')
        
        // Description should be searchable when present
        if (mockDataSets[dataType][0] && 'description' in mockDataSets[dataType][0]) {
          expect(config.searchableFields).toContain('description')
        }
      })
    })
  })

  describe('Performance Consistency', () => {
    it('should render within acceptable time limits across data types', async () => {
      const dataTypes = Object.keys(mockDataSets) as Array<keyof typeof mockDataSets>

      for (const dataType of dataTypes) {
        const startTime = performance.now()
        
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: mockDataSets[dataType],
            dataType: dataType
          }
        })

        const endTime = performance.now()
        const renderTime = endTime - startTime

        // Should render within 100ms (adjust threshold as needed)
        expect(renderTime).toBeLessThan(100)

        wrapper.unmount()
      }
    })

    it('should handle large datasets consistently', async () => {
      // Create large dataset for each type
      const largeDataSets = Object.keys(mockDataSets).reduce((acc, dataType) => {
        const baseItem = mockDataSets[dataType as keyof typeof mockDataSets][0]
        acc[dataType as keyof typeof mockDataSets] = Array.from({ length: 100 }, (_, i) => ({
          ...baseItem,
          id: i + 1,
          name: `${baseItem.name} ${i + 1}`
        }))
        return acc
      }, {} as typeof mockDataSets)

      const dataTypes = Object.keys(largeDataSets) as Array<keyof typeof largeDataSets>

      for (const dataType of dataTypes) {
        const startTime = performance.now()
        
        const wrapper = mount(OptimizedDataTable, {
          props: {
            data: largeDataSets[dataType],
            dataType: dataType
          }
        })

        const endTime = performance.now()
        const renderTime = endTime - startTime

        // Should handle large datasets within reasonable time
        expect(renderTime).toBeLessThan(500)
        
        // Should still render all expected elements
        expect(wrapper.find('[data-testid="optimized-table"]').exists()).toBe(true)

        wrapper.unmount()
      }
    })
  })
})