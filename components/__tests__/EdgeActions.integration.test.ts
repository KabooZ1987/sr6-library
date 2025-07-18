import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EdgeActionsPage from '~/pages/edgeActions.vue'

// Mock the services and components
vi.mock('~/services/columnConfiguration', () => ({
  columnConfigurationService: {
    getModalSections: vi.fn(() => [
      {
        title: 'Basic Information',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'cost', label: 'Edge Cost', type: 'number' },
          { key: 'restriction', label: 'Restriction', type: 'text' }
        ]
      }
    ])
  }
}))

vi.mock('~/services/enums', () => ({
  EdgeActionRestrictions: ['None', 'Combat Only', 'Social Only'],
  SourceBooks: ['Core Rulebook', 'Street Grimoire', 'Run & Gun']
}))

// Mock Nuxt composables
vi.mock('#app', () => ({
  useAsyncData: vi.fn(() => ({
    data: {
      value: [
        {
          id: '1',
          name: 'Test Edge Action',
          cost: 2,
          restriction: 'Combat Only',
          description: 'Test description',
          source: 'Core Rulebook',
          page: 123,
          updated_at: '2024-01-01'
        }
      ]
    },
    pending: { value: false }
  }))
}))

// Mock $fetch
global.$fetch = vi.fn()

describe('EdgeActions Page Integration', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the page with OptimizedDataTable', async () => {
    wrapper = mount(EdgeActionsPage, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table">Mocked OptimizedDataTable</div>',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view', 'edit', 'delete']
          },
          DetailModal: {
            template: '<div data-testid="detail-modal">Mocked DetailModal</div>',
            props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton'],
            emits: ['close', 'edit']
          },
          Dialog: {
            template: '<div data-testid="dialog"><slot /></div>',
            props: ['visible', 'modal', 'header', 'style', 'breakpoints'],
            emits: ['update:visible']
          },
          Button: {
            template: '<button data-testid="button"><slot /></button>',
            props: ['label', 'icon', 'severity'],
            emits: ['click']
          },
          'input-field': {
            template: '<input data-testid="input-field" />',
            props: ['type', 'modelValue', 'label', 'required'],
            emits: ['update:modelValue']
          },
          'select-field': {
            template: '<select data-testid="select-field" />',
            props: ['modelValue', 'required', 'options', 'label'],
            emits: ['update:modelValue']
          }
        }
      }
    })

    await nextTick()

    // Check that the page renders
    expect(wrapper.exists()).toBe(true)
    
    // Check that OptimizedDataTable is rendered with correct props
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('edgeActions')
    expect(dataTable.props('searchable')).toBe(true)
    expect(dataTable.props('filterable')).toBe(true)
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount(EdgeActionsPage, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table" @click="$emit(\'view\', testItem)">Mocked OptimizedDataTable</div>',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view', 'edit', 'delete'],
            setup(props, { emit }) {
              const testItem = { id: '1', name: 'Test Action' }
              return { testItem }
            }
          },
          DetailModal: {
            template: '<div data-testid="detail-modal" v-if="visible">Mocked DetailModal</div>',
            props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton'],
            emits: ['close', 'edit']
          },
          Dialog: { template: '<div />' },
          Button: { template: '<button />' },
          'input-field': { template: '<input />' },
          'select-field': { template: '<select />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    await dataTable.trigger('click')
    await nextTick()

    // Check that DetailModal becomes visible
    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount(EdgeActionsPage, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table">Mocked OptimizedDataTable</div>',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view', 'edit', 'delete']
          },
          DetailModal: { template: '<div />' },
          Dialog: {
            template: '<div data-testid="dialog" v-if="visible"><slot /></div>',
            props: ['visible'],
            emits: ['update:visible']
          },
          Button: { template: '<button />' },
          'input-field': { template: '<input />' },
          'select-field': { template: '<select />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = {
      id: '1',
      name: 'Test Action',
      cost: 2,
      restriction: 'Combat Only',
      description: 'Test description',
      source: 'Core Rulebook',
      page: 123
    }

    // Simulate edit event
    await dataTable.vm.$emit('edit', testItem)
    await nextTick()

    // Check that edit modal opens
    const dialog = wrapper.findComponent({ name: 'Dialog' })
    expect(dialog.props('visible')).toBe(true)
  })

  it('should handle delete action with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    global.$fetch = vi.fn().mockResolvedValue({})

    wrapper = mount(EdgeActionsPage, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table">Mocked OptimizedDataTable</div>',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view', 'edit', 'delete']
          },
          DetailModal: { template: '<div />' },
          Dialog: { template: '<div />' },
          Button: { template: '<button />' },
          'input-field': { template: '<input />' },
          'select-field': { template: '<select />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { id: '1', name: 'Test Action' }

    // Simulate delete event
    await dataTable.vm.$emit('delete', testItem)
    await nextTick()

    // Check that confirmation was called
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Test Action"?')
    
    // Check that API call was made
    expect(global.$fetch).toHaveBeenCalledWith('/api/edge_action', {
      method: 'DELETE',
      body: JSON.stringify({ id: '1' })
    })

    confirmSpy.mockRestore()
  })

  it('should configure edgeActions data type correctly', async () => {
    wrapper = mount(EdgeActionsPage, {
      global: {
        stubs: {
          OptimizedDataTable: {
            template: '<div data-testid="optimized-data-table">Mocked OptimizedDataTable</div>',
            props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
            emits: ['view', 'edit', 'delete']
          },
          DetailModal: { template: '<div />' },
          Dialog: { template: '<div />' },
          Button: { template: '<button />' },
          'input-field': { template: '<input />' },
          'select-field': { template: '<select />' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    
    // Verify that the correct data type is passed
    expect(dataTable.props('dataType')).toBe('edgeActions')
    
    // Verify that search and filter are enabled
    expect(dataTable.props('searchable')).toBe(true)
    expect(dataTable.props('filterable')).toBe(true)
  })
})