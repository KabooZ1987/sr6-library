<template>
    <div>
        <!-- Edit Modal -->
        <Dialog v-model:visible="isOpen" modal :header="isEditForm ? 'Edit Edge Action' : 'Add New Edge Action'" 
                :style="{ width: '90vw', maxWidth: '600px' }" 
                :breakpoints="{ '1024px': '85vw', '768px': '95vw', '480px': '98vw' }"
                :dismissableMask="true"
                :closeOnEscape="true"
                class="edit-modal"
        >
            <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input-field type="text" v-model="Name" label="Name" :required="true" />
                    <input-field type="number" v-model="Cost" label="Edge Cost" :required="true" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input-field type="number" v-model="Page" label="Page" :required="true" />
                    <select-field v-model="Source" :required="true" :options="SourceBooks" label="Source" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select-field v-model="Restriction" :required="true" :options="EdgeActionRestrictions" label="Restriction" />
                    <div></div> <!-- Empty div for grid alignment -->
                </div>

                <div class="field">
                    <label class="block text-sm font-medium mb-2">Description<span class="text-red-500">*</span></label>
                    <textarea 
                        v-model="Description" 
                        class="w-full p-3 border border-gray-300 rounded-md bg-neutral-100 dark:bg-neutral-800 dark:border-gray-600 min-h-[120px]" 
                        placeholder="Enter edge action description..."
                    />
                </div>
            </div>
            
            <template #footer>
                <div class="flex justify-end gap-2">
                    <Button label="Cancel" severity="secondary" @click="closeModal" />
                    <Button label="Save" @click="Validation" />
                </div>
            </template>
        </Dialog>

        <!-- Detail Modal -->
        <DetailModal
            :visible="showDetailModal"
            :item="selectedItem"
            :data-type="'edgeActions'"
            :modal-sections="modalSections"
            :show-edit-button="true"
            @close="showDetailModal = false"
            @edit="editItem"
        />

        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">Edge Actions</h1>
                <Button 
                    label="Add New Edge Action" 
                    icon="pi pi-plus" 
                    @click="addData"
                    class="add-button"
                />
            </div>

            <div class="data-table">
                <OptimizedDataTable
                    :data="data || []"
                    data-type="edgeActions"
                    :loading="pending"
                    :searchable="true"
                    :filterable="true"
                    @view="viewItem"
                    @edit="editItem"
                    @delete="confirmDelete"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from "uuid"
import { EdgeActionRestrictions, SourceBooks } from "~/services/enums"
import { columnConfigurationService } from "~/services/columnConfiguration"

// Reactive data
const reloadTrigger = ref(0)
const isEditForm = ref(false)
const isOpen = ref(false)
const showDetailModal = ref(false)
const selectedItem = ref(null)

// Form fields
const Name = ref('')
const Cost = ref(null)
const Restriction = ref('')
const Page = ref(null)
const Source = ref('')
const Description = ref('')

// Data fetching
const { data, pending } = await useAsyncData(
    "edge_action",
    () => $fetch("/api/edge_action"),
    {
        watch: [reloadTrigger],
    }
)

// Modal configuration for DetailModal
const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('edgeActions')
    } catch (error) {
        console.error('Error getting modal sections:', error)
        return []
    }
})

// Event handlers for OptimizedDataTable
function viewItem(item) {
    selectedItem.value = item
    showDetailModal.value = true
}

function editItem(item) {
    selectedItem.value = item
    isEditForm.value = true
    
    // Populate form fields
    Name.value = item.name || ''
    Cost.value = item.cost || null
    Restriction.value = item.restriction || ''
    Page.value = item.page || null
    Source.value = item.source || ''
    Description.value = item.description || ''
    
    isOpen.value = true
}

function confirmDelete(item) {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        deleteItem(item.id)
    }
}

function deleteItem(id) {
    $fetch("/api/edge_action", {
        method: "DELETE",
        body: JSON.stringify({ id }),
    }).then(() => {
        reloadTrigger.value += 1
    }).catch(error => {
        console.error('Error deleting edge action:', error)
        alert('Failed to delete edge action. Please try again.')
    })
}

function addData() {
    isEditForm.value = false
    clearForm()
    isOpen.value = true
}

function closeModal() {
    isOpen.value = false
    clearForm()
}

function clearForm() {
    Name.value = ''
    Cost.value = null
    Restriction.value = ''
    Page.value = null
    Source.value = ''
    Description.value = ''
    selectedItem.value = null
}

function Validation() {
    const errors = []
    
    if (!Name.value?.trim()) errors.push('Name is required')
    if (!Cost.value && Cost.value !== 0) errors.push('Edge Cost is required')
    if (!Restriction.value?.trim()) errors.push('Restriction is required')
    if (!Page.value && Page.value !== 0) errors.push('Page is required')
    if (!Source.value?.trim()) errors.push('Source is required')
    if (!Description.value?.trim()) errors.push('Description is required')
    
    if (errors.length > 0) {
        alert('Please fix the following errors:\n' + errors.join('\n'))
        return
    }
    
    saveData()
}

function saveData() {
    const element = {
        name: Name.value.trim(),
        cost: parseFloat(Cost.value),
        restriction: Restriction.value.trim(),
        page: parseInt(Page.value),
        source: Source.value.trim(),
        description: Description.value.trim(),
        updated_at: new Date()
    }

    if (isEditForm.value && selectedItem.value) {
        // Update existing item
        element.id = selectedItem.value.id
    } else {
        // Create new item
        element.id = uuidv4()
    }

    $fetch("/api/edge_action", {
        method: "POST",
        body: JSON.stringify({ upsert: element }),
    }).then(() => {
        reloadTrigger.value += 1
        closeModal()
    }).catch(error => {
        console.error('Error saving edge action:', error)
        alert('Failed to save edge action. Please try again.')
    })
}
</script>

<style scoped>
.page-container {
    padding: 1.5rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-title {
    font-size: 2rem;
    font-weight: bold;
    color: var(--text-color);
    margin: 0;
}

.add-button {
    background: var(--primary-color);
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 500;
}

.data-table {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-color);
}

.field textarea {
    resize: vertical;
}

/* Edit Modal Responsive Styles */
.edit-modal :deep(.p-dialog-header) {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.edit-modal :deep(.p-dialog-content) {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* Touch-friendly form elements */
.edit-modal :deep(.p-inputtext),
.edit-modal :deep(.p-dropdown),
.edit-modal :deep(.p-textarea),
.edit-modal textarea {
  min-height: 2.75rem;
  font-size: 1rem;
}

.edit-modal :deep(.p-dropdown-trigger) {
  min-width: 2.75rem;
}

.edit-modal :deep(.p-button) {
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* Responsive page layout */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
    text-align: center;
  }
  
  .add-button {
    width: 100%;
    justify-content: center;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
  
  .edit-modal :deep(.p-dialog-header) {
    padding: 1rem;
  }
  
  .edit-modal :deep(.p-dialog-content) {
    padding: 0 1rem 1rem 1rem;
  }
  
  .edit-modal .space-y-4 > * + * {
    margin-top: 1.25rem;
  }
  
  .edit-modal .grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .edit-modal :deep(.p-dialog-footer) {
    padding: 0.75rem 1rem 1rem 1rem;
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .edit-modal :deep(.p-dialog-footer .flex) {
    flex-direction: column-reverse;
    width: 100%;
  }
  
  .edit-modal :deep(.p-dialog-footer .p-button) {
    width: 100%;
    min-height: 3rem;
  }
  
  /* Enhanced touch targets for mobile */
  .edit-modal :deep(.p-inputtext),
  .edit-modal :deep(.p-dropdown),
  .edit-modal :deep(.p-textarea),
  .edit-modal textarea {
    min-height: 3rem;
    font-size: 1rem;
    padding: 0.75rem;
  }
  
  .edit-modal :deep(.p-dropdown-trigger) {
    min-width: 3rem;
  }
  
  .edit-modal textarea {
    min-height: 100px;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 0.75rem;
  }
  
  .page-header {
    margin-bottom: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .edit-modal :deep(.p-dialog) {
    margin: 0.5rem;
  }
  
  .edit-modal :deep(.p-dialog-header) {
    padding: 0.75rem;
  }
  
  .edit-modal :deep(.p-dialog-content) {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }
  
  .edit-modal :deep(.p-dialog-footer) {
    padding: 0.75rem;
  }
  
  .edit-modal :deep(.p-dialog-footer .p-button) {
    min-height: 3.25rem;
    font-size: 1.1rem;
  }
  
  /* Extra large touch targets for very small screens */
  .edit-modal :deep(.p-inputtext),
  .edit-modal :deep(.p-dropdown),
  .edit-modal :deep(.p-textarea),
  .edit-modal textarea {
    min-height: 3.25rem;
    font-size: 1.1rem;
    padding: 0.875rem;
  }
  
  .edit-modal :deep(.p-dropdown-trigger) {
    min-width: 3.25rem;
  }
  
  .edit-modal textarea {
    min-height: 120px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .data-table {
        background: var(--surface-card);
    }
}
</style>

