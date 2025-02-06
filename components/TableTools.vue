<template>
    <div class="data-table">
      <div class="table-tools flex justify-between items-center p-4">
        <InputField type="text" v-model="searchWord" placeholder="Search here..." class="w-64" />
  
        <UButton
          @click="$emit('addData')"
          label="+ New Data"
          color="fuchsia"  
          variant="solid"
          size="md"
          class="rounded-md"
        />
      </div>
  
      <div class="scrollable overflow-y-auto h-[65vh] overflow-x-hidden">
        <UTable :columns="props.columns" :rows="filteredData" @select="select" class="border border-primary-200 dark:border-primary-700">
          <template #description-data="{ row }">
            <div class="overflow-ellipsis overflow-hidden w-32">{{ row.description }}</div>
          </template>
        </UTable>
      </div>
  
      <USlideover v-model="isOpen">
      <div class="p-4 flex-1">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-zinc-700 dark:text-zinc-50">{{ selected.name }}</h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
            </div>
          </template>

          <div class="space-y-4">  <template v-for="column in props.columns" :key="column.key">
              <div v-if="column.key !== 'updated_at' && column.key !== 'id'">  <label :for="column.key" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ column.label }}</label>
                <component
                  :is="getComponent(column)"  :id="column.key"
                  :value="selected[column.key]"
                  disabled  class="no-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 dark:bg-neutral-800 dark:border-gray-600 dark:text-white no-select"
                  no-select

                />
              </div>
            </template>
          </div>

          <template #footer>
            <div class="space-y-4 flex flex-col justify-center mt-4">
              <UButton color="black" label="Edit" icon="i-heroicons-pencil-square-20-solid" block @click="$emit('getData', selected)" />
              <UButton color="black" label="Delete" icon="i-heroicons-trash-20-solid" block @click="confirmDelete" />
            </div>
          </template>
        </UCard>
      </div>
    </USlideover>
    </div>
  </template>
  
  <script setup>
  import Swal from "sweetalert2";
  
  const props = defineProps(["columns", "data"]);
  const emit = defineEmits(["getData", "delData", "addData"]);
  
  const searchWord = ref("");
  const isOpen = ref(false);
  const selected = ref({});
  
  const select = (element) => {
    selected.value = element;
    isOpen.value = true;
  };
  
  const confirmDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      iconColor: "red",
      denyButtonText: "No, Abort",
      confirmButtonText: "Yes, Delete!",
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: false,
      denyButtonColor: "green",
      confirmButtonColor: "red",
    }).then((result) => {
      if (result.isConfirmed) {
        emit("delData", selected.value.id);
        isOpen.value = false;
      }
    });
  };
  
  const filteredData = computed(() => {
    if (!searchWord.value) {
      return props.data;
    }
    const searchTerm = searchWord.value.trim().toLowerCase();
    return props.data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );

  });
const getComponent = (column) => {
        switch (column.type) { // Check for a 'type' property in your column definitions
            case 'number':
                return 'input'; // Use regular input for numbers
            default:
                if (column.key === 'description') return 'Textarea' //for description use UTextarea
                return 'Input'; // Default to InputField
        }
};
  </script>
  
  <style scoped>
  /* Removed all custom styles and used Tailwind classes instead */
  input{
    padding:0.5rem;
    height:100%;
  }
  textarea{
    padding: 0.5rem;
    height:20vh;
  }
  .no-select {
  user-select: none;
  -webkit-user-select: none; /* For Safari */
  -moz-user-select: none; /* For Firefox */
  -ms-user-select: none; /* For Internet Explorer/Edge */
}
  </style>