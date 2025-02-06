<template>
    <div>
      <UModal v-model="isOpen" prevent-close>
        <UCard
          :ui="{
            ring: '',
            divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          }"
        >
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ isEditForm ? "Edit" : "Add New Item" }}
              </h3>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="closeModal"
              />
            </div>
          </template>
  
          <section class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <InputField v-model="form.name" label="Name" :required="true" />
              <SelectField
                v-model="form.type"
                :options="ActionTypes"
                label="Action Type"
                :required="true"
              />
              <SelectField
                v-model="form.attribute"
                :options="Attributes"
                label="Attribute"
                :required="true"
              />
              <SelectField
                v-model="form.skill"
                :options="Skills"
                label="Skill"
                :required="true"
              />
              <UCheckbox v-model="form.homebrew" label="Is Homebrew" :required="true" />
              <SelectField
                v-model="form.source"
                :options="SourceBooks"
                label="Source"
              />
              <InputField type="number" v-model="form.page" label="Page" />
              </div>
  
            <div class="field">
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description*</label>
              <textarea
                id="description"
                v-model="form.description"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 dark:bg-neutral-800 dark:border-gray-600 dark:text-white"
                rows="4"
              ></textarea>
            </div>
          </section>
  
          <div class="mt-4">
            <UButton size="sm" color="blue" variant="solid" @click="validateAndSave">
              Save
            </UButton>
          </div>
        </UCard>
      </UModal>
  
      <h1>ACTIONS</h1>
      <div class="data-table">
        <TableTools
          :columns="columns"
          :data="data"
          @add-data="openAddModal"
          @get-data="openEditModal"
          @del-data="deleteData"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { v4 as uuidv4 } from "uuid";
  import { ActionTypes, Attributes, Skills, SourceBooks } from "~/services/enums";
  
  const isOpen = ref(false);
  const isEditForm = ref(false);
  const reloadTrigger = ref(0);
  const selectedRow = ref(null);
  
  const form = ref({
    id: null,
    name: null,
    description: null,
    attribute: null,
    skill: null,
    type: null,
    page: null,
    source: null,
    homebrew: null,
    updated_at: null,
  });
  
  const columns = [
  {
        key: "name",
        label: "Name",
        sortable: true,
    },
    {
        key: "description",
        label: "Description",
        sortable: true,
    },
    {
        key: "attribute",
        label: "Attribute",
        sortable: true,
    },
    {
        key: "skill",
        label: "Skill",
        sortable: true,
    },
    {
        key: "type",
        label: "Type",
        sortable: true,
    },
    {
        key: "homebrew",
        label: "Homebrew",
        sortable: true,
    },
    {
        key: "source",
        label: "Source",
        sortable: true
    },
    {
        key: "updated_at",
        label: "Date",
        sortable: true,

    }
  ];
  
  const { data } = await useAsyncData("actions", () => $fetch("/api/common_action"), {
    watch: [reloadTrigger],
  });
  
  const closeModal = () => {
    isOpen.value = false;
    resetForm();
  };
  
  const resetForm = () => {
    Object.assign(form.value, {
      id: null,
      name: null,
      description: null,
      attribute: null,
      skill: null,
      type: null,
      page: null,
      source: null,
      homebrew: null,
      updated_at: null,
    });
  };
  
  const deleteData = async (id) => {
    await $fetch("/api/common_action", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    reloadTrigger.value++;
  };
  
  const openAddModal = () => {
    isEditForm.value = false;
    isOpen.value = true;
    resetForm();
  };
  
  const openEditModal = (rowData) => {
    isEditForm.value = true;
    selectedRow.value = rowData;
    Object.assign(form.value, rowData); // Directly populate the form
    isOpen.value = true;
  };
  
  const validateAndSave = () => {
    const { name, homebrew, description } = form.value;
    if (!name) {
      alert("Name is required");
    } else if (homebrew === null) {
      alert("Homebrew is required");
    } else if (!description) {
      alert("Description is required");
    } else {
      saveData();
    }
  };
  
  const saveData = async () => {
    if (!isEditForm.value) {
      form.value.id = uuidv4();
      form.value.updated_at = new Date();
    } else {
      form.value.id = selectedRow.value.id;
      form.value.updated_at = selectedRow.value.updated_at;
    }
  
    try {
      await $fetch("/api/common_action", {
        method: "POST",
        body: JSON.stringify({ upsert: form.value }),
      });
      reloadTrigger.value++;
      closeModal();
    } catch (error) {
      console.error("Error saving data:", error);
      // Handle error, e.g., display an error message
      alert("An error occurred while saving. Please try again.");
    }
  };
  </script>
  
  <style lang="scss" scoped>
  // Removed unnecessary and complex styles. Use Tailwind classes instead.
  .field {
    label {
      @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
    }
    textarea {
      @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 dark:bg-neutral-800 dark:border-gray-600 dark:text-white;
      min-height: 150px; // Adjust as needed
      resize: vertical;
    }
  }
  </style>