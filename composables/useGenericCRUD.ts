import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useAsyncData } from '#app'
import { useToastService } from '~/services/toastService'
import { useConfirm } from 'primevue/useconfirm'

export function useGenericCRUD(entityName: string, apiUrl: string) {
  const toastService = useToastService()
  const confirm = useConfirm()

  const reloadTrigger = ref(0)
  const showDetailModal = ref(false)
  const showEditModal = ref(false)
  const isEditForm = ref(false)
  const selectedItem = ref<any>(null)
  const saving = ref(false)

  const { data, pending, refresh } = useAsyncData(entityName, () => $fetch(apiUrl), {
    watch: [reloadTrigger],
  })

  function viewItem(item: any) {
    selectedItem.value = item
    showDetailModal.value = true
  }

  function editItem(item: any) {
    selectedItem.value = { ...item }
    isEditForm.value = true
    showEditModal.value = true
  }

  function addData() {
    selectedItem.value = null
    isEditForm.value = false
    showEditModal.value = true
  }

  function closeModal() {
    showEditModal.value = false
    selectedItem.value = null
  }

  function closeDetailModal() {
    showDetailModal.value = false
    selectedItem.value = null
  }

  async function handleDelete(item: any) {
    confirm.require({
      message: `Are you sure you want to delete "${item.name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await $fetch(apiUrl, {
            method: 'DELETE',
            body: JSON.stringify({ id: item.id }),
          })
          toastService.success('Success', `${entityName} deleted successfully`)
          reloadTrigger.value += 1
        } catch (error) {
          console.error(`Error deleting ${entityName}:`, error)
          toastService.error('Error', `Failed to delete ${entityName}`)
        }
      }
    })
  }

  async function saveItem(payload: any) {
    // Basic validation
    if (!payload.name?.trim()) {
      toastService.warn('Validation Error', 'Name is required')
      return
    }

    saving.value = true
    try {
      if (!isEditForm.value) {
        payload.id = uuidv4()
      }
      payload.updated_at = new Date()

      await $fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({ upsert: payload }),
      })

      toastService.success('Success', `${entityName} saved successfully`)
      closeModal()
      reloadTrigger.value += 1
    } catch (error) {
      console.error(`Error saving ${entityName}:`, error)
      toastService.error('Error', `Failed to save ${entityName}`)
    } finally {
      saving.value = false
    }
  }

  return {
    data,
    pending,
    refresh,
    selectedItem,
    showDetailModal,
    showEditModal,
    isEditForm,
    saving,
    viewItem,
    editItem,
    addData,
    closeModal,
    closeDetailModal,
    handleDelete,
    saveItem
  }
}
