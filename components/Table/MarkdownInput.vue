<template>
  <div>
    <Textarea v-model="modelValue" rows="4" class="w-full" />
    <div class="mt-2 p-2 border rounded bg-gray-50 dark:bg-neutral-800 dark:border-gray-600">
      <div class="text-sm font-semibold mb-1">Preview</div>
      <div class="prose dark:prose-invert max-w-none" v-html="renderMarkdown(modelValue)" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const modelValue = defineModel();

function renderMarkdown(text) {
  return marked.parse(text || '');
}
</script>
