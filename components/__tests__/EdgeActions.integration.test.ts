import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import EdgeActionsPage from '~/pages/edgeActions.vue'

// Mock the global functions
const mockFetch = vi.fn()
const mockUseAsyncData = vi.fn()
const mockUseConfirm = vi.fn()
const mockUseToast = vi.fn()

// Mock data
const mockEdgeActionsData = [
  {
    id: '1',
    name: 'Test Action',
    cost: 2,
    restriction: 'any',
    description: 'Test description',
    source: 'core',
    page: 123,
    updated_at: new Date('2024-01-01')
  }
]

// Mock global functions
;(global as any).useAsyncData = mockUseAsyncData
;(global as any).$fetch = mockFetch

// Mock the composables
vi.mock('#app', () => ({
  useAsyncData: (...args: any[]) => (global as any).useAsyncData(...args)
}))

vi.mock('#imports', () => ({
  useAsyncData: (...args: any[]) => (global as any).useAsyncData(...args),
  useHead: vi.fn(),
  useRuntimeConfig: vi.fn(() => ({ public: {} }))
}))

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => mockUseConfirm()
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => mockUseToast()
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: () => 'test-uuid'
}))

describe('EdgeActions Page Integration', () => {
  let wrapper: any
  let mockConfirm: any
  let mockToast: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockConfirm = {
      require: vi.fn()
    }
    mockToast = {
      add: vi.fn()
    }
    
    mockUseConfirm.mockReturnValue(mockConfirm)
    mockUseToast.mockReturnValue(mockToast)
    
    mockUseAsyncData.mockReturnValue({
      data: { value: mockEdgeActionsData },
      pending: { value: false },
      refresh: vi.fn()
    })
    
    mockFetch.mockResolvedValue([])
  })

  const commonStubs = {
    OptimizedDataTable: {
      name: 'OptimizedDataTable',
      template: '<div data-testid="optimized-data-table">Mocked OptimizedDataTable</div>',
      props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
      emits: ['view', 'edit', 'delete']
    },
    GenericEditModal: {
      name: 'GenericEditModal',
      template: '<div data-testid="generic-edit-modal" v-if="visible"><slot /></div>',
      props: ['visible', 'item', 'dataType', 'isEdit', 'title'],
      emits: ['close', 'save', 'update:visible']
    },
    DetailModal: {
      name: 'DetailModal',
      template: '<div data-testid="detail-modal" v-if="visible">Mocked DetailModal</div>',
      props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton'],
      emits: ['close', 'edit']
    },
    Button: {
      template: '<button data-testid="button" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>',
      props: ['label', 'icon', 'severity'],
      emits: ['click']
    }
  }

  it('should render the page with OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeActionsPage /></Suspense>',
      components: { EdgeActionsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check that the page renders
    expect(wrapper.exists()).toBe(true)
    
    // Check that OptimizedDataTable is rendered with correct props
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('edgeActions')
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeActionsPage /></Suspense>',
      components: { EdgeActionsPage }
    }, {
      global: {
        stubs: {
          ...commonStubs,
          OptimizedDataTable: {
            name: 'OptimizedDataTable',
            template: '<div data-testid="optimized-data-table" @click="$emit(\'view\', testItem)">Mocked OptimizedDataTable</div>',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view', 'edit', 'delete'],
            setup(props, { emit }) {
              const testItem = { id: '1', name: 'Test Action' }
              return { testItem }
            }
          }
        }
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.trigger('click')
    await nextTick()

    // Check that DetailModal becomes visible
    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeActionsPage /></Suspense>',
      components: { EdgeActionsPage }
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
      name: 'Test Action',
      cost: 2,
      restriction: 'any',
      description: 'Test description',
      source: 'core',
      page: 123
    }

    // Simulate edit event
    await dataTable.vm.$emit('edit', testItem)
    await nextTick()

    // Check that generic edit modal opens
    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.exists()).toBe(true)
    expect(editModal.props('visible')).toBe(true)
  })

  it('should handle delete action with confirmation', async () => {
    mockFetch.mockResolvedValue({})

    wrapper = mount({
      template: '<Suspense><EdgeActionsPage /></Suspense>',
      components: { EdgeActionsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { id: '1', name: 'Delete Me' }

    // Simulate delete event
    await dataTable.vm.$emit('delete', testItem)
    
    expect(mockConfirm.require).toHaveBeenCalled()
  })

  it('should handle add data action', async () => {
    wrapper = mount({
      template: '<Suspense><EdgeActionsPage /></Suspense>',
      components: { EdgeActionsPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const addButton = wrapper.find('.add-button')
    await addButton.trigger('click')
    await nextTick()

    // Check that edit modal opens in add mode
    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.props('visible')).toBe(true)
    expect(editModal.props('isEdit')).toBe(false)
  })
})