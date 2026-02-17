<template>
    <div>
        <!-- Generic Edit Modal -->
        <GenericEditModal
            v-model:visible="isOpen"
            :item="selectedItem"
            data-type="edgeBoosts"
            :is-edit="isEditForm"
            title="Edge Boost"
            @close="closeModal"
            @save="handleSave"
        />

        <!-- Detail Modal -->
        <DetailModal
            :visible="showDetailModal"
            :item="selectedItem"
            :data-type="'edgeBoosts'"
            :modal-sections="modalSections"
            :show-edit-button="true"
            @close="closeDetailModal"
            @edit="editItem"
        />

        <h1>EDGE BOOSTS</h1>

        <div class="data-table">
            <!-- Add New Button -->
            <div class="mb-4">
                <Button 
                    icon="pi pi-plus" 
                    label="Add New Edge Boost" 
                    @click="addData"
                    class="add-button"
                />
            </div>

            <!-- Optimized Data Table -->
            <OptimizedDataTable
                :data="data || []"
                data-type="edgeBoosts"
                :loading="pending"
                :searchable="true"
                :filterable="true"
                @view="viewItem"
                @edit="editItem"
                @delete="confirmDelete"
            />
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
    closeDetailModal,
    closeModal,
    handleDelete: confirmDelete,
    saveItem: handleSave
} = useGenericCRUD('edge_boost', '/api/edge_boost');

// Get modal sections configuration for edgeBoosts
const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('edgeBoosts');
    } catch (error) {
        console.error('Error getting modal sections:', error);
        return [];
    }
});
</script>