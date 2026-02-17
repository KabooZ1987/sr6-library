import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGenericCRUD } from '~/composables/useGenericCRUD'
import { nextTick, ref } from 'vue'

vi.mock('#app', () => ({
  useAsyncData: vi.fn().mockImplementation((...args: any[]) => (global as any).useAsyncData(...args)),
  $fetch: vi.fn().mockImplementation((...args: any[]) => (global as any).$fetch(...args))
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => (global as any).mockToast
}))

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => (global as any).mockConfirm
}))

vi.mock('uuid', () => ({
  v4: () => 'test-uuid'
}))

describe('useGenericCRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global as any).useAsyncData = vi.fn().mockReturnValue({
      data: ref([]),
      pending: ref(false),
      refresh: vi.fn()
    })
    ;(global as any).$fetch = vi.fn()
    ;(global as any).mockToast = { add: vi.fn() }
    ;(global as any).mockConfirm = { require: vi.fn() }
  })

  it('should initialize with default state', () => {
    const { 
      selectedItem, 
      showDetailModal, 
      showEditModal, 
      isEditForm 
    } = useGenericCRUD('test', '/api/test')

    expect(selectedItem.value).toBeNull()
    expect(showDetailModal.value).toBe(false)
    expect(showEditModal.value).toBe(false)
    expect(isEditForm.value).toBe(false)
  })

  it('should handle view action', () => {
    const { viewItem, selectedItem, showDetailModal } = useGenericCRUD('test', '/api/test')
    const item = { id: '1', name: 'Test' }
    
    viewItem(item)
    
    expect(selectedItem.value).toEqual(item)
    expect(showDetailModal.value).toBe(true)
  })

  it('should handle edit action', () => {
    const { editItem, selectedItem, showEditModal, isEditForm } = useGenericCRUD('test', '/api/test')
    const item = { id: '1', name: 'Test' }
    
    editItem(item)
    
    expect(selectedItem.value).toEqual(item)
    expect(showEditModal.value).toBe(true)
    expect(isEditForm.value).toBe(true)
  })

  it('should handle add action', () => {
    const { addData, selectedItem, showEditModal, isEditForm } = useGenericCRUD('test', '/api/test')
    
    addData()
    
    expect(selectedItem.value).toBeNull()
    expect(showEditModal.value).toBe(true)
    expect(isEditForm.value).toBe(false)
  })
})
