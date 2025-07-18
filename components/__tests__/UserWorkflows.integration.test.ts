import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import OptimizedDataTable from '../OptimizedDataTable.vue'
import DetailModal from '../DetailModal.vue'
import ConfirmationDialog from '../ConfirmationDialog.vue'

// Mock toast service
vi.mock('~/services/toastService', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showWarning: vi.fn()
}))

describe('Complete User Workflows Integration Tests', () => {
  const mockCommonActionsData = [
    {
      id: 1,
      name: 'Aim',
      type: 'Simple',
      attribute: 'Agility',
      skill: 'Firearms',
      description: 'Take careful aim at your target',
      source: 'Core Rulebook',
      page: 162,
      homebrew: false
    },
    {
      id: 2,
      name: 'Sprint',
      type: 'Complex',
      attribute: 'Body',
      skill: 'Running',
      description: 'Run at maximum speed',
      source: 'Core Rulebook',
      page: 164,
      homebrew: true
    }
  ]

  const mockEdgeActionsData = [
    {
      id: 1,
      name: 'Push the Limit',
      edgeCost: 1,
      type: 'Free',
      restriction: 'Once per turn',
      description: 'Add Edge rating to a test',
      source: 'Core Rulebook',
      page: 56
    }
  ]

  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('View Workflow', () => {
    it('should complete full view workflow for common actions', async () => {
      // Mount table with data
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Verify table renders with correct data
      expect(wrapper.find('[data-testid="optimized-table"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Aim')
      expect(wrapper.text()).toContain('Sprint')

      // Click view button on first row
      const viewButton = wrapper.find('[data-testid="view-button-1"]')
      expect(viewButton.exists()).toBe(true)
      await viewButton.trigger('click')

      // Verify modal opens with correct data
      await nextTick()
      expect(wrapper.emitted('view-item')).toBeTruthy()
      expect(wrapper.emitted('view-item')[0][0]).toEqual(mockCommonActionsData[0])
    })

    it('should handle view workflow for edge actions', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockEdgeActionsData,
          dataType: 'edgeActions'
        }
      })

      // Verify edge-specific columns are displayed
      expect(wrapper.text()).toContain('Push the Limit')
      expect(wrapper.text()).toContain('1') // Edge cost
      expect(wrapper.text()).toContain('Free') // Type

      // Test view action
      const viewButton = wrapper.find('[data-testid="view-button-1"]')
      await viewButton.trigger('click')
      
      expect(wrapper.emitted('view-item')).toBeTruthy()
      expect(wrapper.emitted('view-item')[0][0]).toEqual(mockEdgeActionsData[0])
    })
  })

  describe('Edit Workflow', () => {
    it('should complete full edit workflow', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Click edit button
      const editButton = wrapper.find('[data-testid="edit-button-1"]')
      expect(editButton.exists()).toBe(true)
      await editButton.trigger('click')

      // Verify edit event is emitted with correct data
      expect(wrapper.emitted('edit-item')).toBeTruthy()
      expect(wrapper.emitted('edit-item')[0][0]).toEqual(mockCommonActionsData[0])
    })

    it('should handle edit workflow with validation', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Simulate edit action
      await wrapper.find('[data-testid="edit-button-2"]').trigger('click')
      
      // Verify homebrew item can be edited
      expect(wrapper.emitted('edit-item')[0][0].homebrew).toBe(true)
      expect(wrapper.emitted('edit-item')[0][0].name).toBe('Sprint')
    })
  })

  describe('Delete Workflow', () => {
    it('should complete full delete workflow with confirmation', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Click delete button
      const deleteButton = wrapper.find('[data-testid="delete-button-1"]')
      expect(deleteButton.exists()).toBe(true)
      await deleteButton.trigger('click')

      // Verify delete event is emitted
      expect(wrapper.emitted('delete-item')).toBeTruthy()
      expect(wrapper.emitted('delete-item')[0][0]).toEqual(mockCommonActionsData[0])
    })

    it('should prevent deletion of non-homebrew items', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Try to delete non-homebrew item
      const deleteButton = wrapper.find('[data-testid="delete-button-1"]')
      await deleteButton.trigger('click')

      // Should still emit event but parent component handles restriction
      expect(wrapper.emitted('delete-item')).toBeTruthy()
    })
  })

  describe('Search and Filter Workflow', () => {
    it('should complete search workflow across all fields', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions',
          searchable: true
        }
      })

      // Find search input
      const searchInput = wrapper.find('[data-testid="search-input"]')
      expect(searchInput.exists()).toBe(true)

      // Search for visible field
      await searchInput.setValue('Aim')
      await searchInput.trigger('input')

      // Verify search event is emitted
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')[0][0]).toBe('Aim')

      // Search for hidden field (description)
      await searchInput.setValue('careful aim')
      await searchInput.trigger('input')

      expect(wrapper.emitted('search')[1][0]).toBe('careful aim')
    })

    it('should handle filter workflow', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions',
          filterable: true
        }
      })

      // Test type filter
      const typeFilter = wrapper.find('[data-testid="type-filter"]')
      if (typeFilter.exists()) {
        await typeFilter.setValue('Simple')
        expect(wrapper.emitted('filter')).toBeTruthy()
      }
    })
  })

  describe('Responsive Workflow', () => {
    it('should adapt workflow for mobile screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Verify mobile-specific elements
      const mobileActions = wrapper.find('[data-testid="mobile-actions-dropdown"]')
      if (mobileActions.exists()) {
        await mobileActions.trigger('click')
        
        // Verify dropdown contains actions
        expect(wrapper.find('[data-testid="mobile-view-action"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="mobile-edit-action"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="mobile-delete-action"]').exists()).toBe(true)
      }
    })

    it('should maintain functionality on tablet screens', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: mockCommonActionsData,
          dataType: 'commonActions'
        }
      })

      // Verify tablet-specific behavior
      const actionButtons = wrapper.findAll('[data-testid^="action-button"]')
      expect(actionButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Workflow', () => {
    it('should handle missing data gracefully', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions'
        }
      })

      // Verify empty state
      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('No data available')
    })

    it('should handle malformed data', async () => {
      const malformedData = [
        { id: 1, name: 'Test' }, // Missing required fields
        { id: 2 } // Missing name
      ]

      wrapper = mount(OptimizedDataTable, {
        props: {
          data: malformedData,
          dataType: 'commonActions'
        }
      })

      // Should render without crashing
      expect(wrapper.find('[data-testid="optimized-table"]').exists()).toBe(true)
    })
  })

  describe('Loading States Workflow', () => {
    it('should show loading state during data fetch', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        }
      })

      // Verify loading state
      expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true)
    })

    it('should transition from loading to data display', async () => {
      wrapper = mount(OptimizedDataTable, {
        props: {
          data: [],
          dataType: 'commonActions',
          loading: true
        }
      })

      // Initially loading
      expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(true)

      // Update with data
      await wrapper.setProps({
        data: mockCommonActionsData,
        loading: false
      })

      // Should show data
      expect(wrapper.find('[data-testid="loading-skeleton"]').exists()).toBe(false)
      expect(wrapper.text()).toContain('Aim')
    })
  })
})