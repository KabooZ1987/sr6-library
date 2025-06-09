<template>
  <DataTable :value="items" dataKey="id" :paginator="true" :rows="10">
    <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" />
    <Column header="Actions">
      <template #body="slotProps">
        <Button icon="pi pi-eye" @click="viewItem(slotProps.data)" />
        <Button icon="pi pi-pencil" @click="editItem(slotProps.data)" />
      </template>
    </Column>
  </DataTable>

  <ViewModal :visible="showView" :item="selectedItem" @close="showView = false" />
  <EditModal :visible="showEdit" :item="selectedItem" @close="showEdit = false" @save="saveItem" />
</template>

<script setup>
import { ref } from 'vue';
import ViewModal from './ViewModal.vue';
import EditModal from './EditModal.vue';

const props = defineProps({
  items: Array,
  columns: Array
});

const showView = ref(false);
const showEdit = ref(false);
const selectedItem = ref(null);

function viewItem(item) {
  selectedItem.value = item;
  showView.value = true;
}

function editItem(item) {
  selectedItem.value = item;
  showEdit.value = true;
}

function saveItem(updatedItem) {
  // emit or handle saving here
  showEdit.value = false;
}
</script>
