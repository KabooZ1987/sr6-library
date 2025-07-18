<template>
    <div>
        <!-- Edit Modal -->
        <Dialog v-model="isOpen" prevent-close>
            <Card :ui="{
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            {{ (isEditForm ? "Edit" : "Add New Item") }}
                        </h3>
                        <Button icon="i-heroicons-x-mark-20-solid" class="w-12 h-12" style="padding:0!important" :pt="{
                                icon:'w-8 h-8'
                                }"
                            @click="xButton()" />
                    </div>
                </template>

                <section>
                    <div class="Form">
                        <input-field type="text" v-model="Name" label="Name" :required="true" />
                        <input-field type="number" v-model="Cost" label="Cost" :required="true" />
                    </div>

                    <div class="Form">
                        <input-field type="number" v-model="Page" label="Page" :required="true" />
                        <select-field v-model="Source" :required="true" :options="SourceBooks" label="Source" />
                    </div>

                    <div class="field">
                        <div>
                            <p>Description</p>
                            <textarea type="text" v-model="Description" class="bg-neutral-100 dark:bg-neutral-800 mt-1" />
                        </div>
                    </div>
                </section>
                <div class="save-button">
                    <Button size="sm" color="blue" variant="solid" :trailing="false" @click="saveData()">
                        Save
                    </Button>
                </div>
            </Card>
        </Dialog>

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
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { SourceBooks } from "~/services/enums";
import { columnConfigurationService } from "~/services/columnConfiguration";

const UUID = ref();

// Edit Modal State
const isEditForm = ref(true);
const reloadTrigger = ref(0);
const isOpen = ref(false);
const dataOfEachRow = ref();

// Detail Modal State
const showDetailModal = ref(false);
const selectedItem = ref(null);

// Form Fields
const Name = ref(null);
const Cost = ref(null);
const Page = ref(null);
const Source = ref(null);
const Description = ref(null);

const element = ref({
    id: null,
    name: null,
    cost: null,
    description: null,
    source: null,
    page: null,
    updated_at: null,
});

// Get modal sections configuration for edgeBoosts
const modalSections = computed(() => {
    try {
        return columnConfigurationService.getModalSections('edgeBoosts');
    } catch (error) {
        console.error('Error getting modal sections:', error);
        return [];
    }
});

// Data fetching with loading state
const { data, pending } = await useAsyncData(
    "edge_boost",
    () => $fetch("/api/edge_boost"),
    {
        watch: [reloadTrigger],
    }
);

// Modal Management Functions
function xButton() {
    isOpen.value = false;
    Name.value = null;
    Cost.value = null;
    Page.value = null;
    Source.value = null;
    Description.value = null;
}

function closeDetailModal() {
    showDetailModal.value = false;
    selectedItem.value = null;
}

// OptimizedDataTable Event Handlers
function viewItem(item) {
    selectedItem.value = item;
    showDetailModal.value = true;
}

function editItem(item) {
    isEditForm.value = true;
    dataOfEachRow.value = item;
    isOpen.value = true;

    Name.value = item.name;
    Cost.value = item.cost;
    Page.value = item.page;
    Source.value = item.source;
    Description.value = item.description;
}

function confirmDelete(item) {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
        delData(item.id);
    }
}

// Legacy Functions (updated for new structure)
function delData(id) {
    $fetch("/api/edge_boost", {
        method: "Delete",
        body: JSON.stringify({ id }),
    }).then(() => reloadTrigger.value += 1)
}

function addData() {
    isOpen.value = true;
    isEditForm.value = false;
}

function getData(rowData) {
    // Legacy function - now handled by editItem
    editItem(rowData);
    return dataOfEachRow;
}

function saveData() {
    if (!isEditForm.value) {
        data.value.filter((row) => {
            do {
                UUID.value = uuidv4();
            } while (UUID.value === row.id);
        });
        element.value.id = UUID.value;
        element.value.updated_at = new Date();
    } else {
        element.value.id = dataOfEachRow.value.id;
        element.value.updated_at = dataOfEachRow.value.updated_at;
    }

    if (Name.value !== null) {
        element.value.name = Name.value.toString();
    } else {
        element.value.name = dataOfEachRow.value.name;
    }

    if (Cost.value !== null) {
        element.value.cost = parseFloat(Cost.value)
    } else {
        element.value.cost = parseFloat(dataOfEachRow.value.cost)
    }

    if (Page.value !== null) {
        element.value.page = parseInt(Page.value)
    } else {
        element.value.page = parseInt(dataOfEachRow.value.page)
    }

    if (Source.value !== null) {
        element.value.source = Source.value.toString();
    } else {
        element.value.source = dataOfEachRow.value.source;
    }

    if (Description.value !== null) {
        element.value.description = Description.value.toString();
    } else {
        element.value.description = dataOfEachRow.value.description;
    }

    $fetch("/api/edge_boost", {
        method: "POST",
        body: JSON.stringify({ upsert: element.value }),
    }).then(() => reloadTrigger.value += 1)

    xButton();
    // $fetch("/api/edge_boost",{method:"POST",body:{"upsert":element}})
}
</script>