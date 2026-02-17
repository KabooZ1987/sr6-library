import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import HomebrewPage from '~/pages/homeBrew.vue'

// Mock the global functions
const mockFetch = vi.fn()
const mockUseAsyncData = vi.fn()
const mockUseConfirm = vi.fn()
const mockUseToast = vi.fn()

// Mock data
const mockHomebrewData = [
  {
    id: '1',
    name: 'Test Homebrew 1',
    category: 'Combat',
    description: 'This is a test homebrew description for combat mechanics.',
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Test Homebrew 2',
    category: 'Matrix',
    description: 'This is a test homebrew description for matrix operations.',
    updated_at: new Date('2024-01-02')
  }
]

// Mock the composables
vi.mock('#app', () => ({
  useAsyncData: () => mockUseAsyncData()
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

// Mock the enums
vi.mock('~/services/enums', () => ({
  RuleCategories: [
    { label: 'Combat', value: 'Combat' },
    { label: 'Matrix', value: 'Matrix' },
    { label: 'Magic', value: 'Magic' }
  ]
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

describe('Homebrew Page Integration', () => {
  let wrapper: any
  let mockConfirm: any
  let mockToast: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Setup mock implementations
    mockConfirm = {
      require: vi.fn()
    }
    mockToast = {
      add: vi.fn()
    }
    
    mockUseConfirm.mockReturnValue(mockConfirm)
    mockUseToast.mockReturnValue(mockToast)
    
    mockUseAsyncData.mockReturnValue({
      data: { value: mockHomebrewData },
      pending: { value: false },
      refresh: vi.fn()
    })
    
    mockFetch.mockResolvedValue({ success: true })
  })

  it('should render the page with OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><HomebrewPage /></Suspense>',
      components: { HomebrewPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Check page structure
    expect(wrapper.find('h1').text()).toBe('HOMEBREW')
    expect(wrapper.find('[data-testid="optimized-data-table"]').exists()).toBe(true)
    
    // Check that OptimizedDataTable receives correct props
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('homebrew')
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><HomebrewPage /></Suspense>',
      components: { HomebrewPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.vm.$emit('view', mockHomebrewData[0])
    await nextTick()

    // Check that detail modal is shown
    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
    expect(detailModal.props('item')).toEqual(mockHomebrewData[0])
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><HomebrewPage /></Suspense>',
      components: { HomebrewPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.vm.$emit('edit', mockHomebrewData[0])
    await nextTick()

    // Check that edit modal is shown
    const editModal = wrapper.findComponent({ name: 'GenericEditModal' })
    expect(editModal.props('visible')).toBe(true)
    expect(editModal.props('isEdit')).toBe(true)
  })

  it('should handle delete action with confirmation', async () => {
    wrapper = mount({
      template: '<Suspense><HomebrewPage /></Suspense>',
      components: { HomebrewPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.vm.$emit('delete', mockHomebrewData[0])
    
    // Check that confirmation dialog is triggered
    expect(mockConfirm.require).toHaveBeenCalled()
  })

  it('should show add new button', async () => {
    wrapper = mount({
      template: '<Suspense><HomebrewPage /></Suspense>',
      components: { HomebrewPage }
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

  it('should handle detail modal close', async () => {
    wrapper = mount({
      template: '<Suspense><HomebrewPage /></Suspense>',
      components: { HomebrewPage }
    }, {
      global: {
        stubs: commonStubs
      }
    })

    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    const vm = wrapper.findComponent(HomebrewPage).vm
    vm.showDetailModal = true
    vm.selectedItem = mockHomebrewData[0]
    await nextTick()

    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    await detailModal.vm.$emit('close')
    await nextTick()

    expect(vm.showDetailModal).toBe(false)
  })
})