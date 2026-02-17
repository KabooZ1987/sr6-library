import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, Suspense } from 'vue'
import EdgeBoostsPage from '~/pages/edgeBoosts.vue'

// Mock the global functions
const mockFetch = vi.fn()
const mockUseAsyncData = vi.fn()
const mockUseConfirm = vi.fn()
const mockUseToast = vi.fn()

// Mock data
const mockData = [
  {
    id: '1',
    name: 'Test Edge Boost 1',
    cost: 2,
    description: 'Test description 1',
    source: 'Core Rulebook',
    page: 123,
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Test Edge Boost 2',
    cost: 1,
    description: 'Test description 2',
    source: 'Street Lethal',
    page: 456,
    updated_at: new Date('2024-01-02')
  }
]

// Mock global functions
;(global as any).useAsyncData = mockUseAsyncData
;(global as any).$fetch = mockFetch

// Mock the composables
vi.mock('#app', () => ({
  useAsyncData: (...args: any[]) => (global as any).useAsyncData(...args)
}))

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => mockUseConfirm()
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => mockUseToast()
}))

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234'
}))

const commonStubs = {
  OptimizedDataTable: {
    name: 'OptimizedDataTable',
    template: '<div data-testid="optimized-data-table" />',
    props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
    emits: ['view', 'edit', 'delete']
  },
  DetailModal: {
    name: 'DetailModal',
    template: '<div data-testid="detail-modal" />',
    props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton'],
    emits: ['close', 'edit']
  },
  GenericEditModal: {
    name: 'GenericEditModal',
    template: '<div data-testid="generic-edit-modal" v-if="visible"><slot /></div>',
    props: ['visible', 'item', 'dataType', 'isEdit', 'title'],
    emits: ['close', 'save', 'update:visible']
  },
  Button: {
    template: '<button data-testid="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
    props: ['label', 'icon', 'loading', 'severity', 'type'],
    emits: ['click']
  },
  ConfirmDialog: {
    template: '<div data-testid="confirm-dialog" />'
  },
  Toast: {
    template: '<div data-testid="toast" />'
  }
}

describe('EdgeBoosts Page Integration', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseConfirm.mockReturnValue({
      require: vi.fn()
    })
    mockUseToast.mockReturnValue({
      add: vi.fn()
    })
    
    mockUseAsyncData.mockReturnValue({
      data: { value: mockData },
      pending: { value: false },
      refresh: vi.fn()
    })
    
    mockFetch.mockResolvedValue({ success: true })
  })

  it('should render the page with OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that the page renders
    expect(wrapper.find('h1').text()).toBe('EDGE BOOSTS')
    
    // Check that OptimizedDataTable is rendered with correct props
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('edgeBoosts')
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { id: '1', name: 'Test Edge Boost' }

    // Simulate view action
    await dataTable.vm.$emit('view', testItem)
    await nextTick()

    // Check that detail modal is shown
    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
    expect(detailModal.props('item')).toEqual(testItem)
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { 
      id: '1', 
      name: 'Test Edge Boost',
      cost: 2,
      description: 'Test description',
      source: 'Core Rulebook',
      page: 123
    }

    // Simulate edit action
    await dataTable.vm.$emit('edit', testItem)
    await nextTick()

    // Check that edit modal is opened
    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.props('visible')).toBe(true)
    expect(editModal.props('isEdit')).toBe(true)
  })

  it('should handle delete action with confirmation', async () => {
    const mockConfirm = { require: vi.fn() }
    mockUseConfirm.mockReturnValue(mockConfirm)

    wrapper = mount({
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { id: '1', name: 'Test Edge Boost' }

    // Simulate delete action
    await dataTable.vm.$emit('delete', testItem)
    
    expect(mockConfirm.require).toHaveBeenCalled()
  })

  it('should show add new button', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const addButton = wrapper.find('.add-button')
    expect(addButton.exists()).toBe(true)
    
    // Test add button functionality
    await addButton.trigger('click')
    await nextTick()
    
    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.props('visible')).toBe(true)
    expect(editModal.props('isEdit')).toBe(false)
  })

  it('should handle detail modal close', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const vm = wrapper.findComponent(EdgeBoostsPage).vm
    vm.showDetailModal = true
    vm.selectedItem = { id: '1', name: 'Test' }
    await nextTick()

    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    await detailModal.vm.$emit('close')
    await nextTick()

    expect(vm.showDetailModal).toBe(false)
    expect(vm.selectedItem).toBe(null)
  })
})