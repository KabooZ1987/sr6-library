<template>
  <div>
    <!-- Generic Edit Modal -->
    <GenericEditModal
        v-model:visible="showEditModal"
        :item="selectedItem"
        data-type="homebrew"
        :is-edit="isEditForm"
        title="Homebrew"
        @close="closeEditModal"
        @save="handleSave"
    />

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
import { computed } from 'vue';
import { useGenericCRUD } from '~/composables/useGenericCRUD';
import { columnConfigurationService } from '~/services/columnConfiguration';

const {
    data,
    pending,
    selectedItem,
    showDetailModal,
    showEditModal,
    isEditForm,
    viewItem: handleView,
    editItem: handleEdit,
    addData: handleAdd,
    closeDetailModal,
    closeModal: closeEditModal,
    handleDelete,
    saveItem: handleSave,
    saving
} = useGenericCRUD('homebrew', '/api/homebrew');

const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('homebrew');
    } catch (error) {
        console.error('Error getting modal sections:', error);
        return [];
    }
});

defineExpose({
    handleAdd
});
</script>

