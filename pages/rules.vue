<template>
    <div>
        <!-- Generic Edit Modal -->
        <GenericEditModal
            v-model:visible="showEditModal"
            :item="selectedItem"
            data-type="rules"
            :is-edit="isEditForm"
            title="Rule"
            @close="closeEditModal"
            @save="handleSave"
        />

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
} = useGenericCRUD('rules', '/api/rule');

const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('rules');
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
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .data-table {
        background: var(--surface-card);
    }
}
</style>