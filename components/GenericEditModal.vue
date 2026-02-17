<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :header="isEdit ? 'Edit ' + title : 'Add New ' + title" 
    :style="{ width: '90vw', maxWidth: '600px' }" 
    :breakpoints="{ '1024px': '85vw', '768px': '95vw', '480px': '98vw' }"
    :dismissableMask="true"
    :closeOnEscape="true"
    class="generic-edit-modal"
    @hide="$emit('close')"
  >
    <div class="space-y-4 pt-2">
      <div v-for="section in modalSections" :key="section.title" class="section">
        <h3 v-if="section.title" class="text-lg font-semibold mb-3 border-b pb-1">{{ section.title }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="field in section.fields" :key="field.key" :class="field.type === 'markdown' || field.type === 'textarea' ? 'md:col-span-2' : ''">
            <template v-if="field.type === 'text' || field.type === 'number'">
              <InputField 
                v-model="localItem[field.key]" 
                :label="field.label" 
                :type="field.type" 
                :required="true" 
              />
            </template>
            <template v-else-if="field.type === 'select'">
              <SelectField 
                v-model="localItem[field.key]" 
                :label="field.label" 
                :options="getFieldOptions(field.key)" 
                :required="true" 
              />
            </template>
            <template v-else-if="field.type === 'boolean'">
              <div class="field flex items-center gap-2">
                <Checkbox v-model="localItem[field.key]" :binary="true" :id="field.key" />
                <label :for="field.key" class="text-sm font-medium">{{ field.label }}</label>
              </div>
            </template>
            <template v-else-if="field.type === 'date'">
              <div class="field">
                <label class="block text-sm font-medium mb-1">{{ field.label }}</label>
                <div class="p-2 bg-gray-100 dark:bg-neutral-700 rounded text-sm">
                  {{ localItem[field.key] ? new Date(localItem[field.key]).toLocaleString() : 'Never' }}
                </div>
              </div>
            </template>
            <template v-else-if="field.type === 'markdown'">
              <div class="field">
                <label class="block text-sm font-medium mb-2">{{ field.label }}<span class="text-red-500">*</span></label>
                <MarkdownInput v-model="localItem[field.key]" />
              </div>
            </template>
            <template v-else-if="field.type === 'textarea'">
              <div class="field">
                <label class="block text-sm font-medium mb-2">{{ field.label }}<span class="text-red-500">*</span></label>
                <textarea 
                  v-model="localItem[field.key]" 
                  class="w-full p-3 border border-gray-300 rounded-md bg-neutral-100 dark:bg-neutral-800 dark:border-gray-600 min-h-[120px]" 
                  :placeholder="'Enter ' + field.label.toLowerCase() + '...'"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="$emit('close')" />
        <Button label="Save" @click="handleSave" />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { columnConfigurationService } from '~/services/columnConfiguration'
import * as enums from '~/services/enums'

const visible = defineModel('visible', { type: Boolean })
const props = defineProps({
  item: Object,
  dataType: String,
  isEdit: Boolean,
  title: String
})

const emit = defineEmits(['close', 'save'])

const localItem = ref({})

watch(() => props.item, (newItem) => {
  if (newItem) {
    localItem.value = { ...newItem }
  } else {
    localItem.value = {}
  }
}, { immediate: true })

const modalSections = computed(() => {
  try {
    return columnConfigurationService.getModalSections(props.dataType)
  } catch (error) {
    console.error('Error getting modal sections:', error)
    return []
  }
})

function getFieldOptions(key) {
  // Map field keys to enums
  if (key === 'source') return enums.SourceBooks
  if (key === 'restriction') return enums.EdgeActionRestrictions
  if (key === 'category') return enums.RuleCategories
  if (key === 'type') return enums.ActionTypes
  if (key === 'attribute') return enums.Attributes
  if (key === 'skill') return enums.Skills
  return []
}

function handleSave() {
  // Basic validation could be added here
  emit('save', { ...localItem.value })
}
</script>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.generic-edit-modal :deep(.p-dialog-header) {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
}

.generic-edit-modal :deep(.p-dialog-content) {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

/* Touch-friendly form elements */
.generic-edit-modal :deep(.p-inputtext),
.generic-edit-modal :deep(.p-dropdown),
.generic-edit-modal :deep(.p-textarea),
.generic-edit-modal textarea {
  min-height: 2.75rem;
  font-size: 1rem;
}
</style>
