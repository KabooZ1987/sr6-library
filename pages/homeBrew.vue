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
            <InputField label="Name" v-model="form.name" :required="true" />
            <SelectField label="Category" v-model="form.category" :required="true" :options="RuleCategories" />
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

    <h1>HOMEBREW</h1>

    <div class="data-table">
      <TableTools :columns="columns" :data="data" @add-data="openAddModal" @get-data="openEditModal"
        @del-data="deleteItem" />
    </div>
  </div>
</template>

<script setup>
import { v4 as uuidv4 } from "uuid";
import { RuleCategories } from "~/services/enums";

const isOpen = ref(false);
const isEditForm = ref(false);
const reloadTrigger = ref(0);
const form = ref({
  id: null,
  name: null,
  description: null,
  category: null,
  updated_at: null,
});
const dataOfEachRow = ref(null);

const columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "description", label: "Description", sortable: true },
  { key: "updated_at", label: "Date", sortable: true },
];

const { data } = await useAsyncData("homebrew", () => $fetch("/api/homebrew"), {
  watch: [reloadTrigger],
});

const closeModal = () => {
  isOpen.value = false;
  resetForm();
};

const deleteItem = async (id) => {
  await $fetch("/api/homebrew", { method: "DELETE", body: JSON.stringify({ id }) });
  reloadTrigger.value++;
};

const openAddModal = () => {
  isEditForm.value = false;
  isOpen.value = true;
  resetForm();
};

const openEditModal = (rowData) => {
  isEditForm.value = true;
  isOpen.value = true;
  dataOfEachRow.value = rowData;
  form.value = { ...rowData }; // Use spread operator for a shallow copy
};

const resetForm = () => {
  form.value = {
    id: null,
    name: null,
    description: null,
    category: null,
    updated_at: null,
  };
};

const saveItem = async () => {
  if (!form.value.name || !form.value.category || !form.value.description) {
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
    await $fetch("/api/homebrew", { method: "POST", body: JSON.stringify({ upsert: form.value }) });
    reloadTrigger.value++;
    closeModal();
  } catch (error) {
    console.error("Error saving item:", error);
    // Handle error, e.g., display an error message
    alert("An error occurred while saving. Please try again.");
  }

};
</script>

<style lang="scss" scoped>
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

.w-full {
  width: 100%;
}

.h-48 {
  height: 12rem; // Adjust as needed
}

.bg-neutral-100 {
  background-color: #f5f5f5; // Example, adjust as needed
}

.dark\:bg-neutral-800 {
  @media (prefers-color-scheme: dark) {
    background-color: #272727; // Example, adjust as needed
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

</style>