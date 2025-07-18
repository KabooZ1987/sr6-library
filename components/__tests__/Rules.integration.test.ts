import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
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
  },
  {
    id: '2',
    name: 'Test Rule 2',
    category: 'Matrix',
    description: 'This is a test rule description for matrix operations.',
    homebrew: true,
    source: 'Custom',
    page: null,
    updated_at: new Date('2024-01-02')
  }
]

// Mock global functions
global.useAsyncData = mockUseAsyncData
global.$fetch = mockFetch

// Mock the composables
vi.mock('#app', () => ({
  useAsyncData: mockUseAsyncData,
  $fetch: mockFetch
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
  ],
  SourceBooks: [
    { label: 'Core Rulebook', value: 'Core Rulebook' },
    { label: 'Custom', value: 'Custom' }
  ]
}))

describe('Rules Page Integration', () => {
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
      data: { value: mockRulesData },
      pending: { value: false },
      refresh: vi.fn()
    })
    
    mockFetch.mockResolvedValue({ success: true })
  })

  it('should render the page with OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table" />',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable']
          },
          DetailModal: {
            template: '<div data-testid="detail-modal" />',
            props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton']
          },
          Dialog: {
            template: '<div data-testid="dialog"><slot /></div>',
            props: ['visible', 'modal', 'header', 'style']
          },
          Button: {
            template: '<button data-testid="button"><slot /></button>',
            props: ['label', 'icon', 'loading', 'severity', 'type']
          },
          InputField: {
            template: '<input data-testid="input-field" />',
            props: ['type', 'label', 'required', 'modelValue']
          },
          SelectField: {
            template: '<select data-testid="select-field" />',
            props: ['label', 'required', 'options', 'modelValue']
          },
          Checkbox: {
            template: '<input type="checkbox" data-testid="checkbox" />',
            props: ['binary', 'modelValue']
          },
          Textarea: {
            template: '<textarea data-testid="textarea" />',
            props: ['rows', 'placeholder', 'modelValue']
          },
          ConfirmDialog: {
            template: '<div data-testid="confirm-dialog" />'
          },
          Toast: {
            template: '<div data-testid="toast" />'
          }
        }
      }
    })

    await nextTick()

    // Check page structure
    expect(wrapper.find('h1').text()).toBe('RULES')
    expect(wrapper.find('[data-testid="optimized-data-table"]').exists()).toBe(true)
    
    // Check that OptimizedDataTable receives correct props
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('rules')
    expect(dataTable.props('searchable')).toBe(true)
    expect(dataTable.props('filterable')).toBe(true)
    expect(dataTable.props('data')).toEqual(mockRulesData)
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table" @view="$emit(\'view\', $event)" />',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view']
          },
          DetailModal: {
            template: '<div data-testid="detail-modal" />',
            props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton']
          },
          Dialog: { template: '<div />' },
          Button: { template: '<button />' },
          ConfirmDialog: { template: '<div />' },
          Toast: { template: '<div />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.trigger('view', mockRulesData[0])
    await nextTick()

    // Check that detail modal is shown
    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
    expect(detailModal.props('item')).toEqual(mockRulesData[0])
    expect(detailModal.props('dataType')).toBe('rules')
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table" @edit="$emit(\'edit\', $event)" />',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['edit']
          },
          DetailModal: { template: '<div />' },
          Dialog: {
            template: '<div data-testid="dialog" />',
            props: ['visible']
          },
          Button: { template: '<button />' },
          ConfirmDialog: { template: '<div />' },
          Toast: { template: '<div />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.trigger('edit', mockRulesData[0])
    await nextTick()

    // Check that edit modal is shown
    const editDialog = wrapper.findComponent({ name: 'Dialog' })
    expect(editDialog.props('visible')).toBe(true)
  })

  it('should handle delete action with confirmation', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table" @delete="$emit(\'delete\', $event)" />',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['delete']
          },
          DetailModal: { template: '<div />' },
          Dialog: { template: '<div />' },
          Button: { template: '<button />' },
          ConfirmDialog: { template: '<div />' },
          Toast: { template: '<div />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.trigger('delete', mockRulesData[0])
    await nextTick()

    // Check that confirmation dialog is triggered
    expect(mockConfirm.require).toHaveBeenCalledWith(
      expect.objectContaining({
        message: `Are you sure you want to delete "${mockRulesData[0].name}"?`,
        header: 'Delete Confirmation'
      })
    )
  })

  it('should configure rules data type correctly', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table" />',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable']
          },
          DetailModal: { template: '<div />' },
          Dialog: { template: '<div />' },
          Button: { template: '<button />' },
          ConfirmDialog: { template: '<div />' },
          Toast: { template: '<div />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.props('dataType')).toBe('rules')
    expect(dataTable.props('data')).toEqual(mockRulesData)
    expect(dataTable.props('searchable')).toBe(true)
    expect(dataTable.props('filterable')).toBe(true)
  })

  it('should show add new button', async () => {
    wrapper = mount({
      template: '<Suspense><RulesPage /></Suspense>',
      components: { RulesPage }
    }, {
      global: {
        stubs: {
          OptimizedDataTable: { template: '<div />' },
          DetailModal: { template: '<div />' },
          Dialog: { template: '<div />' },
          Button: {
            template: '<button class="add-button" data-testid="add-button"><slot /></button>',
            props: ['label', 'icon']
          },
          ConfirmDialog: { template: '<div />' },
          Toast: { template: '<div />' }
        }
      }
    })

    await nextTick()

    const addButton = wrapper.find('.add-button')
    expect(addButton.exists()).toBe(true)
  })
})