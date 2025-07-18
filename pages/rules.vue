<template>
    <div>
        <!-- Edit Modal -->
        <Dialog 
            :visible="showEditModal" 
            modal 
            :header="isEditForm ? 'Edit Rule' : 'Add New Rule'"
            :style="{ width: '90vw', maxWidth: '600px' }"
            @hide="closeEditModal"
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
                            v-model="formData.category" 
                            :required="true"
                            :options="RuleCategories"
                            label="Rule Category" 
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
                        <InputField 
                            type="number" 
                            :required="false" 
                            v-model="formData.page" 
                            label="Page" 
                        />
                    </div>
                    <div class="form-row">
                        <SelectField 
                            v-model="formData.source" 
                            :required="false"
                            :options="SourceBooks"
                            label="Source" 
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
                                placeholder="Enter rule description..."
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

        <!-- Detail Modal -->
        <DetailModal
            :visible="showDetailModal"
            :item="selectedItem"
            data-type="rules"
            :modal-sections="modalSections"
            :show-edit-button="true"
            @close="closeDetailModal"
            @edit="handleEdit"
        />

        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">RULES</h1>
                <Button 
                    label="Add New Rule" 
                    icon="pi pi-plus" 
                    @click="handleAdd"
                    class="add-button"
                />
            </div>

            <div class="data-table">
                <OptimizedDataTable 
                    :data="data || []"
                    data-type="rules"
                    :loading="pending"
                    :searchable="true"
                    :filterable="true"
                    @view="handleView"
                    @edit="handleEdit"
                    @delete="handleDelete"
                />
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog />
        
        <!-- Toast Notifications -->
        <Toast />
    </div>
</template>

<!-- Category = source -->

<!-- Homebrew = page -->

<script setup>
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { RuleCategories, SourceBooks } from '~/services/enums';
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
    category: '',
    page: null,
    source: '',
    homebrew: false,
    updated_at: null,
});

// Data fetching
const { data, pending, refresh } = await useAsyncData('rules', () => $fetch('/api/rule'), {
    watch: [reloadTrigger],
});

// Modal configuration
const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('rules');
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
        category: item.category || '',
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
                await $fetch('/api/rule', {
                    method: 'DELETE',
                    body: JSON.stringify({ id: item.id }),
                });
                
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Rule deleted successfully',
                    life: 3000
                });
                
                reloadTrigger.value += 1;
            } catch (error) {
                console.error('Error deleting rule:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete rule',
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
        category: '',
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
    
    if (!formData.value.category?.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Validation Error',
            detail: 'Category is required',
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
        
        await $fetch('/api/rule', {
            method: 'POST',
            body: JSON.stringify({ upsert: payload }),
        });
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Rule ${isEditForm.value ? 'updated' : 'created'} successfully`,
            life: 3000
        });
        
        closeEditModal();
        reloadTrigger.value += 1;
        
    } catch (error) {
        console.error('Error saving rule:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${isEditForm.value ? 'update' : 'create'} rule`,
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
        category: '',
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .p-button {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .data-table {
        background: var(--surface-card);
    }
}
</style>