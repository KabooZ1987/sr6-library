<template>
  <Dialog :visible="visible" modal header="View Details" @hide="$emit('close')">
    <div class="p-fluid">
      <div v-for="(value, key) in item" :key="key" class="mb-3">
        <label class="font-bold text-sm">{{ key }}</label>
        <div v-if="isMarkdown(key)" v-html="renderMarkdown(value)" class="border p-2 bg-gray-50 rounded" />
        <div v-else class="border p-2 bg-gray-100 rounded">{{ value }}</div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  visible: Boolean,
  item: Object
});

const emit = defineEmits(['close']);

function renderMarkdown(text) {
  return marked.parse(text || '');
}

function isMarkdown(key) {
  return key.toLowerCase().includes('markdown') || key.toLowerCase().includes('description');
}
</script>
