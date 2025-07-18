import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick, Suspense } from 'vue'
import EdgeBoostsPage from '~/pages/edgeBoosts.vue'

// Mock the API calls
const mockData = [
  {
    id: '1',
    name: 'Test Edge Boost 1',
    cost: 2,
    description: 'Test description 1',
    source: 'Core Rulebook',
    page: 123,
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    name: 'Test Edge Boost 2',
    cost: 1,
    description: 'Test description 2',
    source: 'Street Lethal',
    page: 456,
    updated_at: '2024-01-02'
  }
]

vi.mock('~/composables/useAsyncData', () => ({
  useAsyncData: vi.fn(() => Promise.resolve({
    data: { value: mockData },
    pending: { value: false }
  }))
}))

// Mock $fetch
global.$fetch = vi.fn().mockResolvedValue({ success: true })

// Mock confirm dialog
global.confirm = vi.fn(() => true)

// Mock PrimeVue components
const mockComponents = {
  Dialog: { template: '<div class="mock-dialog"><slot /></div>' },
  Card: { template: '<div class="mock-card"><slot /></div>' },
  Button: { 
    template: '<button class="mock-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  },
  OptimizedDataTable: {
    template: '<div class="mock-optimized-table" data-testid="optimized-table"></div>',
    props: ['data', 'dataType', 'loading', 'searchable', 'filterable'],
    emits: ['view', 'edit', 'delete']
  },
  DetailModal: {
    template: '<div class="mock-detail-modal" v-if="visible"></div>',
    props: ['visible', 'item', 'dataType', 'modalSections', 'showEditButton'],
    emits: ['close', 'edit']
  },
  InputField: { 
    template: '<input class="mock-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'label', 'type', 'required'],
    emits: ['update:modelValue']
  },
  SelectField: { 
    template: '<select class="mock-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="option in options" :key="option" :value="option">{{ option }}</option></select>',
    props: ['modelValue', 'options', 'label', 'required'],
    emits: ['update:modelValue']
  }
}

describe('EdgeBoosts Page Integration', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the page with OptimizedDataTable', async () => {
    const SuspenseWrapper = {
      template: '<Suspense><EdgeBoostsPage /></Suspense>',
      components: { EdgeBoostsPage, Suspense }
    }

    wrapper = mount(SuspenseWrapper, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await flushPromises()
    await nextTick()

    // Check that the page renders
    expect(wrapper.find('h1').text()).toBe('EDGE BOOSTS')
    
    // Check that OptimizedDataTable is rendered with correct props
    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.exists()).toBe(true)
    expect(dataTable.props('dataType')).toBe('edgeBoosts')
    expect(dataTable.props('searchable')).toBe(true)
    expect(dataTable.props('filterable')).toBe(true)
  })

  it('should handle view action from OptimizedDataTable', async () => {
    wrapper = mount(EdgeBoostsPage, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { id: '1', name: 'Test Edge Boost' }

    // Simulate view action
    await dataTable.vm.$emit('view', testItem)
    await nextTick()

    // Check that detail modal is shown
    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    expect(detailModal.props('visible')).toBe(true)
    expect(detailModal.props('item')).toEqual(testItem)
    expect(detailModal.props('dataType')).toBe('edgeBoosts')
  })

  it('should handle edit action from OptimizedDataTable', async () => {
    wrapper = mount(EdgeBoostsPage, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await nextTick()

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

    // Check that edit modal is opened and form is populated
    expect(wrapper.vm.isOpen).toBe(true)
    expect(wrapper.vm.isEditForm).toBe(true)
    expect(wrapper.vm.Name).toBe(testItem.name)
    expect(wrapper.vm.Cost).toBe(testItem.cost)
    expect(wrapper.vm.Description).toBe(testItem.description)
  })

  it('should handle delete action with confirmation', async () => {
    wrapper = mount(EdgeBoostsPage, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    const testItem = { id: '1', name: 'Test Edge Boost' }

    // Simulate delete action
    await dataTable.vm.$emit('delete', testItem)
    await nextTick()

    // Check that confirmation was called
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Edge Boost"?')
    
    // Check that API delete was called
    expect(global.$fetch).toHaveBeenCalledWith('/api/edge_boost', {
      method: 'Delete',
      body: JSON.stringify({ id: '1' })
    })
  })

  it('should configure edgeBoosts data type correctly', async () => {
    wrapper = mount(EdgeBoostsPage, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await nextTick()

    const dataTable = wrapper.findComponent({ name: 'OptimizedDataTable' })
    expect(dataTable.props('dataType')).toBe('edgeBoosts')
    
    // Check that modal sections are computed correctly
    expect(wrapper.vm.modalSections).toBeDefined()
    expect(Array.isArray(wrapper.vm.modalSections)).toBe(true)
  })

  it('should show add new button', async () => {
    wrapper = mount(EdgeBoostsPage, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await nextTick()

    const addButton = wrapper.find('.add-button')
    expect(addButton.exists()).toBe(true)
    
    // Test add button functionality
    await addButton.trigger('click')
    await nextTick()
    
    expect(wrapper.vm.isOpen).toBe(true)
    expect(wrapper.vm.isEditForm).toBe(false)
  })

  it('should handle detail modal close', async () => {
    wrapper = mount(EdgeBoostsPage, {
      global: {
        components: mockComponents,
        stubs: {
          'client-only': { template: '<div><slot /></div>' }
        }
      }
    })

    await nextTick()

    // Open detail modal first
    wrapper.vm.showDetailModal = true
    wrapper.vm.selectedItem = { id: '1', name: 'Test' }
    await nextTick()

    const detailModal = wrapper.findComponent({ name: 'DetailModal' })
    
    // Simulate close event
    await detailModal.vm.$emit('close')
    await nextTick()

    expect(wrapper.vm.showDetailModal).toBe(false)
    expect(wrapper.vm.selectedItem).toBe(null)
  })
})