<template>
  <div>
    <Textarea v-on="modelValue" rows="4" />
    <div class="mt-2 p-2 border rounded bg-gray-50">
      <div class="text-sm font-semibold">Preview</div>
      <div v-html="renderMarkdown(modelValue)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

function renderMarkdown(text) {
  return marked.parse(text || '');
}
</script>
