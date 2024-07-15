<template>
    <div>
      <DataTable
        :value="value"
        :paginator="paginator"
        :rows="rows"
        :sortField="sortField"
        :sortOrder="sortOrder"
        :filters="filters"
        :selection="selection"
        @selection-change="onSelectionChange"
        :edit-mode="editMode"
        :responsive="true"
        v-bind="$attrs"
        v-on="$listeners"
      >
        <template v-for="(slotContent, slotName) in slots" v-slot:[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps">{{ slotContent }}</slot>
        </template>
      </DataTable>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, defineProps, defineEmits, useSlots, useAttrs } from '@vue/composition-api';
  import DataTable from 'primevue/datatable';
  
  const props = defineProps({
    value: {
      type: Array,
      required: true,
    },
    paginator: {
      type: Boolean,
      default: true,
    },
    rows: {
      type: Number,
      default: 10,
    },
    sortField: {
      type: String,
      required: false,
    },
    sortOrder: {
      type: Number,
      required: false,
    },
    filters: {
      type: Object,
      required: false,
    },
    selection: {
      type: Array,
      required: false,
    },
    editMode: {
      type: String,
      required: false,
    },
  });
  
  const emit = defineEmits(['update:selection']);
  const slots = useSlots();
  const attrs = useAttrs();
  
  const slotsComputed = computed(() => slots);
  
  const onSelectionChange = (event: any) => {
    emit('update:selection', event.value);
  };
  
  </script>
  