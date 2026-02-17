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

        <!-- Generic Edit Modal -->
        <GenericEditModal
            v-model:visible="showEditModal"
            :item="selectedItem"
            data-type="commonActions"
            :is-edit="isEditForm"
            title="Action"
            @close="closeEditModal"
            @save="handleSave"
        />

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
    saveItem: handleSave
} = useGenericCRUD('actions', '/api/common_action');

const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('commonActions');
    } catch (error) {
        console.error('Error getting modal sections:', error);
        return [];
    }
});

defineExpose({
    handleAdd
});
</script>

<style scoped>
.data-table {
  margin-top: 1rem;
}

/* Page header */
h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem;
}
</style>
