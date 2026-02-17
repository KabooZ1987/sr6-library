import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import RulesPage from '~/pages/rules.vue'

// Mock the global functions
const mockFetch = vi.fn()
const mockUseAsyncData = vi.fn()
const mockUseConfirm = vi.fn()
const mockUseToast = vi.fn()

// Mock data
const mockRulesData = [
  {
    id: '1',
    name: 'Test Rule 1',
    category: 'Combat',
    description: 'This is a test rule description for combat mechanics.',
    homebrew: false,
    source: 'Core Rulebook',
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

describe('Rules Page Integration', () => {
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
      data: { value: mockRulesData },
      pending: { value: false },
      refresh: vi.fn()
    })
    
    mockFetch.mockResolvedValue({ success: true })
  })

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

  it('should render the page with OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.exists()).toBe(true)
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('rules')
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.vm.$emit('view', mockRulesData[0])
    await nextTick()

    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
    expect(detailModal.props('item')).toEqual(mockRulesData[0])
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.vm.$emit('edit', mockRulesData[0])
    await nextTick()

    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.props('visible')).toBe(true)
    expect(editModal.props('isEdit')).toBe(true)
  })

  it('should handle delete action with confirmation', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.vm.$emit('delete', mockRulesData[0])
    
    expect(mockConfirm.require).toHaveBeenCalled()
  })

  it('should show add new button and handle add action', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const addButton = wrapper.find('.add-button')
    expect(addButton.exists()).toBe(true)
    
    await addButton.trigger('click')
    await nextTick()

    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.props('visible')).toBe(true)
    expect(editModal.props('isEdit')).toBe(false)
  })
})