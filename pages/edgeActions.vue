<template>
    <div>
        <!-- Generic Edit Modal -->
        <GenericEditModal
            v-model:visible="isOpen"
            :item="selectedItem"
            data-type="edgeActions"
            :is-edit="isEditForm"
            title="Edge Action"
            @close="closeModal"
            @save="handleSave"
        />

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
import { computed } from 'vue';
import { useGenericCRUD } from '~/composables/useGenericCRUD';
import { columnConfigurationService } from '~/services/columnConfiguration';

const {
    data,
    pending,
    selectedItem,
    showDetailModal,
    showEditModal: isOpen,
    isEditForm,
    viewItem,
    editItem,
    addData,
    closeModal,
    handleDelete: confirmDelete,
    saveItem: handleSave
} = useGenericCRUD('edge_action', '/api/edge_action');

const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('edgeActions');
    } catch (error) {
        console.error('Error getting modal sections:', error);
        return [];
    }
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
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .data-table {
        background: var(--surface-card);
    }
}
</style>

