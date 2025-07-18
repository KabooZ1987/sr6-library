<template>
  <div>
    <!-- Edit Modal -->
    <Dialog 
        :visible="showEditModal" 
        modal 
        :header="isEditForm ? 'Edit Homebrew' : 'Add New Homebrew'"
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
                        label="Category" 
                    />
                </div>
                <div class="form-row">
                    <div class="spacer"></div>
                    <div class="spacer"></div>
                </div>
                <div class="form-row">
                    <ImageUploadButton />
                    <div class="spacer"></div>
                </div>
                <div class="form-full-width">
                    <div class="field">
                        <label class="field-label">Description <span class="required">*</span></label>
                        <Textarea 
                            v-model="formData.description" 
                            rows="6"
                            class="description-textarea"
                            placeholder="Enter homebrew description..."
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
        data-type="homebrew"
        :modal-sections="modalSections"
        :show-edit-button="true"
        @close="closeDetailModal"
        @edit="handleEdit"
    />

    <div class="page-container">
        <div class="page-header">
            <h1 class="page-title">HOMEBREW</h1>
            <Button 
                label="Add New Homebrew" 
                icon="pi pi-plus" 
                @click="handleAdd"
                class="add-button"
            />
        </div>

        <div class="data-table">
            <OptimizedDataTable 
                :data="data || []"
                data-type="homebrew"
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

<script setup>
import { ref, computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { RuleCategories } from '~/services/enums';
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
    updated_at: null,
});

// Data fetching
const { data, pending, refresh } = await useAsyncData('homebrew', () => $fetch('/api/homebrew'), {
    watch: [reloadTrigger],
});

// Modal configuration
const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('homebrew');
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
                await $fetch('/api/homebrew', {
                    method: 'DELETE',
                    body: JSON.stringify({ id: item.id }),
                });
                
                toast.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Homebrew deleted successfully',
                    life: 3000
                });
                
                reloadTrigger.value += 1;
            } catch (error) {
                console.error('Error deleting homebrew:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete homebrew',
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
        
        await $fetch('/api/homebrew', {
            method: 'POST',
            body: JSON.stringify({ upsert: payload }),
        });
        
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: `Homebrew ${isEditForm.value ? 'updated' : 'created'} successfully`,
            life: 3000
        });
        
        closeEditModal();
        reloadTrigger.value += 1;
        
    } catch (error) {
        console.error('Error saving homebrew:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to ${isEditForm.value ? 'update' : 'create'} homebrew`,
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
        updated_at: null,
    };
}

// Expose add function for potential toolbar integration
defineExpose({
    handleAdd
});
</script>

