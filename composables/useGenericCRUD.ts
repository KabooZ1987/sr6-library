import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useAsyncData, $fetch } from '#app'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

export function useGenericCRUD(entityName: string, apiUrl: string) {
  const toast = useToast()
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
          toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `${entityName} deleted successfully`,
            life: 3000
          })
          reloadTrigger.value += 1
        } catch (error) {
          console.error(`Error deleting ${entityName}:`, error)
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to delete ${entityName}`,
            life: 3000
          })
        }
      }
    })
  }

  async function saveItem(payload: any) {
    // Basic validation
    if (!payload.name?.trim()) {
      toast.add({ severity: 'warn', summary: 'Validation Error', detail: 'Name is required' })
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

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${entityName} saved successfully`,
        life: 3000
      })
      closeModal()
      reloadTrigger.value += 1
    } catch (error) {
      console.error(`Error saving ${entityName}:`, error)
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to save ${entityName}`,
        life: 3000
      })
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
