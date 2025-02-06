<template>
    <div>
        <UModal v-model="isOpen" prevent-close>
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            {{ isEditForm ? "Edit" : "Add New Item" }}
                        </h3>
                        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                            @click="closeModal" />
                    </div>
                </template>

                <section class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField type="text" v-model="form.name" label="Name" :required="true" />
                        <InputField type="number" v-model="form.cost" label="Cost" :required="true" />
                        <InputField type="number" v-model="form.page" label="Page" :required="true" />
                        <SelectField v-model="form.source" :required="true" :options="SourceBooks" label="Source" />
                        <SelectField v-model="form.restriction" :required="true" :options="EdgeActionRestrictions"
                            label="Restriction" />
                    </div>

                    <div class="mt-4">
                        <p class="mb-1">Description<span>*</span></p>
                        <textarea v-model="form.description"
                            class="w-full h-48 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 resize-none" />
                    </div>
                </section>

                <div class="p-4">
                    <UButton size="sm" color="blue" variant="solid" @click="saveItem">
                        Save
                    </UButton>
                </div>
            </UCard>
        </UModal>

        <h1>EDGE ACTIONS</h1>

        <div class="data-table">
            <TableTools :columns="columns" :data="data" @add-data="openAddModal" @get-data="openEditModal"
                @del-data="deleteItem" />
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { v4 as uuidv4 } from "uuid";
import { EdgeActionRestrictions, SourceBooks } from "~/services/enums";

const isOpen = ref(false);
const isEditForm = ref(false);
const reloadTrigger = ref(0);
const form = ref({
    id: null,
    name: null,
    cost: null,
    restriction: null,
    description: null,
    source: null,
    page: null,
    updated_at: null,
});
const dataOfEachRow = ref(null);

const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "cost", label: "Cost", sortable: true },
    { key: "restriction", label: "Restriction", sortable: true, type: "string" },
    { key: "description", label: "Description", sortable: true, type: "string" },
    { key: "source", label: "Source", sortable: true, type: "string" },
    { key: "updated_at", label: "Date", sortable: true, type: "string" },
];

const { data } = await useAsyncData("edge_action", () => $fetch("/api/edge_action"), {
    watch: [reloadTrigger],
});

const closeModal = () => {
    isOpen.value = false;
    resetForm();
};

const deleteItem = async (id) => {
    await $fetch("/api/edge_action", { method: "DELETE", body: JSON.stringify({ id }) });
    reloadTrigger.value++;
};

const openAddModal = () => {
    isOpen.value = true;
    isEditForm.value = false;
    resetForm();
};

const openEditModal = (rowData) => {
    isEditForm.value = true;
    isOpen.value = true;
    dataOfEachRow.value = rowData;
    form.value = { ...rowData };
};

const resetForm = () => {
    form.value = {
        id: null,
        name: null,
        cost: null,
        restriction: null,
        description: null,
        source: null,
        page: null,
        updated_at: null,
    };
};

const saveItem = async () => {
    if (Object.values(form.value).some(value => !value)) { //check if ANY value is falsy (null, undefined, '', 0, false)
        alert("Please fill in all required fields.");
        return;
    }

    if (!isEditForm.value) {
        form.value.id = uuidv4();
        form.value.updated_at = new Date();
    } else {
        form.value.id = dataOfEachRow.value.id;
        form.value.updated_at = dataOfEachRow.value.updated_at;
    }

    try {
        await $fetch("/api/edge_action", { method: "POST", body: JSON.stringify({ upsert: form.value }) });
        reloadTrigger.value++;
        closeModal();
    } catch (error) {
        console.error("Error saving item:", error);
        alert("An error occurred while saving. Please try again.");
    }
};
</script>

<style lang="scss" scoped>
/* Utility classes for layout and spacing */
.p-4 {
    padding: 1rem;
}

.grid {
    display: grid;
}

.grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

.md\:grid-cols-2 {
    @media (min-width: 768px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.gap-4 {
    gap: 1rem;
}

.mt-4 {
    margin-top: 1rem;
}

.mb-1 {
    margin-bottom: 0.25rem;
}

/* Utility classes for width, height, background, and borders */
.w-full {
    width: 100%;
}

.h-48 {
    height: 12rem;
}

.bg-neutral-100 {
    background-color: #f5f5f5;
}

.dark\:bg-neutral-800 {
    @media (prefers-color-scheme: dark) {
        background-color: #272727;
    }
}

.rounded-lg {
    border-radius: 0.5rem;
}

.p-2 {
    padding: 0.5rem;
}

.resize-none {
    resize: none;
}

/* Specific styles for data table */
.data-table {
    .table-tools {
        padding: 10px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        align-items: center;
        border-bottom: solid 1px gray;

        button {
            color: rgb(1, 179, 1);
            border-radius: 20px;
            padding: 2px 8px;
            font-size: 15px;
            border: 2px solid rgb(1, 179, 1);

            &:hover {
                color: rgb(5, 235, 5);
                border-color: rgb(5, 235, 5);
            }
        }

        input {
            border-radius: 20px;
            padding: 0 20px;
        }
    }

    .scrollable {
        scrollbar-gutter: stable;
        overflow: scroll;
        height: 65vh;
        overflow-x: hidden;

        &::-webkit-scrollbar {
            width: 10px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgb(1, 179, 1);
            border-radius: 10px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
        }
    }
}

/* Specific styles for save button */
.save-button {
    margin: 0 20px;

    button {
        padding: 10px 20px;
    }
}

.field {
    width: 100%;

    div {
        margin: 20px;

        span {
            color: red;
        }

        textarea {
            width: 100%;
            height: 200px;
            border-radius: 20px;
            padding: 5px 20px;
            resize: none;
        }
    }
}
</style>
