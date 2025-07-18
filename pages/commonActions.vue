<template>
    <div>
        <h1>ACTIONS</h1>
        <div class="data-table">
            <OptimizedDataTable 
                :data="data || []"
                data-type="commonActions"
                :loading="pending"
                :searchable="true"
                :filterable="true"
                @view="handleView"
                @edit="handleEdit"
                @delete="handleDelete"
            />
        </div>

        <!-- Detail Modal -->
        <DetailModal
            :visible="showDetailModal"
            :item="selectedItem"
            data-type="commonActions"
            :modal-sections="modalSections"
            :show-edit-button="true"
            @close="closeDetailModal"
            @edit="handleEdit"
        />

        <!-- Edit Modal -->
        <Dialog 
            :visible="showEditModal" 
            modal 
            :header="isEditForm ? 'Edit Action' : 'Add New Action'"
            :style="{ width: '90vw', maxWidth: '600px' }"
            :breakpoints="{ '1024px': '85vw', '768px': '95vw', '480px': '98vw' }"
            @hide="closeEditModal"
            :dismissableMask="true"
            :closeOnEscape="true"
            class="edit-modal"
        >
            <form @submit.prevent="handleSave" class="p-fluid">
                <div class="form-grid">
                    <div class="form-row">
                        <InputField 
                            type="text" 
                            v-model="formData.name" 
                            label="Name" 
                            :required="true" 
                        />
                        <SelectField 
                            v-model="formData.type" 
                            :required="true"
                            :options="ActionTypes"
                            label="Action Type" 
                        />
                    </div>
                    <div class="form-row">
                        <SelectField 
                            v-model="formData.attribute" 
                            :required="true" 
                            :options="Attributes"
                            label="Attribute" 
                        />
                        <SelectField 
                            v-model="formData.skill" 
                            :required="true" 
                            :options="Skills"
                            label="Skill" 
                        />
                    </div>
                    <div class="form-row">
                        <div class="field">
                            <label class="field-label">Homebrew</label>
                            <Checkbox 
                                v-model="formData.homebrew" 
                                :binary="true"
                                class="homebrew-checkbox"
                            />
                        </div>
                        <SelectField 
                            v-model="formData.source" 
                            :required="false"
                            :options="SourceBooks"
                            label="Source" 
                        />
                    </div>
                    <div class="form-row">
                        <InputField 
                            type="number" 
                            :required="false" 
                            v-model="formData.page" 
                            label="Page" 
                        />
                        <div class="spacer"></div>
                    </div>
                    <div class="form-full-width">
                        <div class="field">
                            <label class="field-label">Description <span class="required">*</span></label>
                            <Textarea 
                                v-model="formData.description" 
                                rows="6"
                                class="description-textarea"
                                placeholder="Enter action description..."
                            />
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <Button 
                        type="button" 
                        label="Cancel" 
                        severity="secondary" 
                        @click="closeEditModal"
                    />
                    <Button 
                        type="submit" 
                        :label="isEditForm ? 'Update' : 'Create'"
                        :loading="saving"
                    />
                </div>
            </form>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />
        
        <!-- Toast Notifications -->
        <Toast />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { ActionTypes, Attributes, Skills, SourceBooks } from '~/services/enums';
import { columnConfigurationService } from '~/services/columnConfiguration';

// Composables
const confirm = useConfirm();
const toast = useToast();

// Reactive state
const reloadTrigger = ref(0);
const showDetailModal = ref(false);
const showEditModal = ref(false);
const isEditForm = ref(false);
const selectedItem = ref(null);
const saving = ref(false);

// Form data
const formData = ref({
    id: null,
    name: '',
    description: '',
    attribute: '',
    skill: '',
    type: '',
    page: null,
    source: '',
    homebrew: false,
    updated_at: null,
});

// Data fetching
const { data, pending, refresh } = await useAsyncData('actions', () => $fetch('/api/common_action'), {
    watch: [reloadTrigger],
});

// Modal configuration
const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('commonActions');
    } catch (error) {
        console.error('Error getting modal sections:', error);
        return [];
    }
});

// Event handlers
function handleView(item) {
    selectedItem.value = item;
    showDetailModal.value = true;
}

function handleEdit(item) {
    selectedItem.value = item;
    isEditForm.value = true;
    
    // Populate form data
    formData.value = {
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        attribute: item.attribute || '',
        skill: item.skill || '',
        type: item.type || '',
        page: item.page || null,
        source: item.source || '',
        homebrew: Boolean(item.homebrew),
        updated_at: item.updated_at,
    };
    
    showEditModal.value = true;
}

function handleDelete(item) {
    confirm.require({
        message: `Are you sure you want to delete "${item.name}"?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'Cancel',
        acceptLabel: 'Delete',
        accept: async () => {
            try {
                await $fetch('/api/common_action', {
                    method: 'DELETE',
                    body: JSON.stringify({ id: item.id }),
                });
                
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Action deleted successfully',
                    life: 3000
                });
                
                reloadTrigger.value += 1;
            } catch (error) {
                console.error('Error deleting action:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete action',
                    life: 3000
                });
            }
        }
    });
}

function handleAdd() {
    selectedItem.value = null;
    isEditForm.value = false;
    
    // Reset form data
    formData.value = {
        id: null,
        name: '',
        description: '',
        attribute: '',
        skill: '',
        type: '',
        page: null,
        source: '',
        homebrew: false,
        updated_at: null,
    };
    
    showEditModal.value = true;
}

async function handleSave() {
    // Validation
    if (!formData.value.name?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Name is required',
            life: 3000
        });
        return;
    }
    
    if (!formData.value.description?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Description is required',
            life: 3000
        });
        return;
    }

    saving.value = true;
    
    try {
        const payload = { ...formData.value };
        
        if (!isEditForm.value) {
            // Generate new ID for new items
            payload.id = uuidv4();
            payload.updated_at = new Date();
        }
        
        // Ensure numeric fields are properly typed
        if (payload.page) {
            payload.page = parseInt(payload.page);
        }
        
        await $fetch('/api/common_action', {
            method: 'POST',
            body: JSON.stringify({ upsert: payload }),
        });
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Action ${isEditForm.value ? 'updated' : 'created'} successfully`,
            life: 3000
        });
        
        closeEditModal();
        reloadTrigger.value += 1;
        
    } catch (error) {
        console.error('Error saving action:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${isEditForm.value ? 'update' : 'create'} action`,
            life: 3000
        });
    } finally {
        saving.value = false;
    }
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedItem.value = null;
}

function closeEditModal() {
    showEditModal.value = false;
    selectedItem.value = null;
    isEditForm.value = false;
    
    // Reset form data
    formData.value = {
        id: null,
        name: '',
        description: '',
        attribute: '',
        skill: '',
        type: '',
        page: null,
        source: '',
        homebrew: false,
        updated_at: null,
    };
}

// Expose add function for potential toolbar integration
defineExpose({
    handleAdd
});
</script>

<style scoped>
.data-table {
  margin-top: 1rem;
}

/* Form Styles */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
}

.form-full-width {
  grid-column: 1 / -1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.required {
  color: var(--red-500);
}

.homebrew-checkbox {
  margin-top: 0.5rem;
}

.spacer {
  /* Empty div for grid alignment */
}

.description-textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
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
.edit-modal :deep(.p-textarea) {
  min-height: 2.75rem;
  font-size: 1rem;
}

.edit-modal :deep(.p-dropdown-trigger) {
  min-width: 2.75rem;
}

.edit-modal :deep(.p-checkbox .p-checkbox-box) {
  width: 1.25rem;
  height: 1.25rem;
}

.edit-modal :deep(.p-button) {
  min-height: 2.75rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .edit-modal :deep(.p-dialog-header) {
    padding: 1rem;
  }
  
  .edit-modal :deep(.p-dialog-content) {
    padding: 0 1rem 1rem 1rem;
  }
  
  .form-grid {
    gap: 1.25rem;
    padding: 0.75rem 0;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding-top: 0.75rem;
  }
  
  .form-actions .p-button {
    width: 100%;
    min-height: 3rem;
  }
  
  .field-label {
    font-size: 0.9rem;
  }
  
  .description-textarea {
    min-height: 100px;
  }
  
  /* Enhanced touch targets for mobile */
  .edit-modal :deep(.p-inputtext),
  .edit-modal :deep(.p-dropdown),
  .edit-modal :deep(.p-textarea) {
    min-height: 3rem;
    font-size: 1rem;
    padding: 0.75rem;
  }
  
  .edit-modal :deep(.p-dropdown-trigger) {
    min-width: 3rem;
  }
  
  .edit-modal :deep(.p-checkbox .p-checkbox-box) {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .homebrew-checkbox {
    margin-top: 0.75rem;
  }
}

@media (max-width: 480px) {
  .edit-modal :deep(.p-dialog) {
    margin: 0.5rem;
  }
  
  .edit-modal :deep(.p-dialog-header) {
    padding: 0.75rem;
  }
  
  .edit-modal :deep(.p-dialog-content) {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }
  
  .form-grid {
    gap: 1rem;
    padding: 0.5rem 0;
  }
  
  .form-actions {
    margin-top: 1rem;
    padding-top: 0.75rem;
  }
  
  .form-actions .p-button {
    min-height: 3.25rem;
    font-size: 1.1rem;
  }
  
  .field-label {
    font-size: 0.85rem;
  }
  
  /* Extra large touch targets for very small screens */
  .edit-modal :deep(.p-inputtext),
  .edit-modal :deep(.p-dropdown),
  .edit-modal :deep(.p-textarea) {
    min-height: 3.25rem;
    font-size: 1.1rem;
    padding: 0.875rem;
  }
  
  .edit-modal :deep(.p-dropdown-trigger) {
    min-width: 3.25rem;
  }
  
  .edit-modal :deep(.p-checkbox .p-checkbox-box) {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Page header */
h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem;
}
</style>
