<template>
  <Dialog :visible="visible" modal header="Edit Entry" @hide="$emit('close')">
    <form class="p-fluid" @submit.prevent="submit">
      <div v-for="(value, key) in localItem" :key="key" class="mb-3">
        <label class="font-bold text-sm">{{ key }}</label>
        <MarkdownInput v-if="isMarkdown(key)" v-model="localItem[key]" />
        <Textarea v-else-if="isTextArea(key)" v-model="localItem[key]" rows="4" />
        <InputText v-else v-model="localItem[key]" />
      </div>
      <Button type="submit" label="Save" />
    </form>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import MarkdownInput from './MarkdownInput.vue';

const props = defineProps({
  visible: Boolean,
  item: Object
});
const emit = defineEmits(['close', 'save']);

const localItem = ref({ ...props.item });

watch(() => props.item, (val) => {
  localItem.value = { ...val };
}, { immediate: true });

function submit() {
  emit('save', localItem.value);
}

function isMarkdown(key) {
  return key.toLowerCase().includes('markdown') || key.toLowerCase().includes('description');
}

function isTextArea(key) {
  return key.toLowerCase().includes('notes') || key.toLowerCase().includes('summary');
}
</script>
