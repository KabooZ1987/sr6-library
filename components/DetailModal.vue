<template>
  <Dialog 
    :visible="visible" 
    modal 
    :header="modalTitle"
    :style="{ width: '90vw', maxWidth: '800px' }"
    :breakpoints="{ '1024px': '85vw', '768px': '95vw', '480px': '98vw' }"
    @hide="handleClose"
    class="detail-modal"
    :dismissableMask="true"
    :closeOnEscape="true"
  >
    <template #header>
      <div class="flex justify-between items-center w-full">
        <h3 class="text-xl font-semibold">{{ modalTitle }}</h3>
        <div class="flex gap-2">
          <Button
            v-if="showNavigation && hasPrevious"
            icon="pi pi-chevron-left"
            severity="secondary"
            size="small"
            @click="$emit('navigate', 'previous')"
            v-tooltip="'Previous entry'"
          />
          <Button
            v-if="showNavigation && hasNext"
            icon="pi pi-chevron-right"
            severity="secondary"
            size="small"
            @click="$emit('navigate', 'next')"
            v-tooltip="'Next entry'"
          />
          <Button
            v-if="showEditButton"
            icon="pi pi-pencil"
            severity="info"
            size="small"
            @click="$emit('edit', item)"
            v-tooltip="'Edit entry'"
          />
        </div>
      </div>
    </template>

    <div class="detail-modal-content">
      <div v-if="loading" class="flex justify-center items-center py-8">
        <ProgressSpinner />
      </div>
      
      <div v-else-if="item && modalSections.length > 0" class="space-y-6">
        <div 
          v-for="section in modalSections" 
          :key="section.title"
          class="detail-section"
        >
          <h4 class="section-title">{{ section.title }}</h4>
          <div class="section-content">
            <div 
              v-for="field in section.fields" 
              :key="field.key"
              class="field-group"
              :class="{ 'field-full-width': field.type === 'markdown' }"
            >
              <label class="field-label">{{ field.label }}</label>
              <div class="field-value">
                <div 
                  v-if="field.type === 'markdown'" 
                  v-html="renderMarkdown(getFieldValue(field.key))"
                  class="markdown-content"
                />
                <Badge 
                  v-else-if="field.type === 'badge'"
                  :value="formatFieldValue(field, getFieldValue(field.key))"
                  :severity="getBadgeSeverity(field.key, getFieldValue(field.key))"
                />
                <Tag
                  v-else-if="field.type === 'boolean'"
                  :value="getFieldValue(field.key) ? 'Yes' : 'No'"
                  :severity="getFieldValue(field.key) ? 'success' : 'secondary'"
                />
                <span 
                  v-else
                  class="field-text"
                  :class="{ 'text-muted': !getFieldValue(field.key) }"
                >
                  {{ formatFieldValue(field, getFieldValue(field.key)) || 'N/A' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="item" class="fallback-content">
        <h4 class="section-title">All Fields</h4>
        <div class="section-content">
          <div 
            v-for="(value, key) in item" 
            :key="key" 
            class="field-group"
            :class="{ 'field-full-width': isMarkdownField(key) }"
          >
            <label class="field-label">{{ formatFieldName(key) }}</label>
            <div class="field-value">
              <div 
                v-if="isMarkdownField(key)" 
                v-html="renderMarkdown(value)"
                class="markdown-content"
              />
              <span v-else class="field-text">{{ value || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">No data available to display</p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { marked } from 'marked';
import { useToastService } from '~/services/toastService';
import type { TableDataType } from '~/types/table-data-optimization';
import type { ModalSection } from '~/services/columnConfiguration';

interface Props {
  visible: boolean;
  item?: TableDataType | null;
  dataType?: string;
  modalSections?: ModalSection[];
  loading?: boolean;
  showEditButton?: boolean;
  showNavigation?: boolean;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  item: null,
  dataType: '',
  modalSections: () => [],
  loading: false,
  showEditButton: true,
  showNavigation: false,
  hasPrevious: false,
  hasNext: false
});

const emit = defineEmits<{
  close: [];
  edit: [item: TableDataType];
  navigate: [direction: 'previous' | 'next'];
}>();

const toastService = useToastService()

const modalTitle = computed(() => {
  if (!props.item) return 'Details';
  return props.item.name || 'Entry Details';
});

/**
 * Handle modal close with error handling
 */
function handleClose() {
  try {
    emit('close')
  } catch (error) {
    console.error('Error closing modal:', error)
    toastService.error('Modal Error', 'Failed to close modal properly')
  }
}

/**
 * Get field value from item with fallback handling
 */
function getFieldValue(fieldKey: string): any {
  if (!props.item) return null;
  return props.item[fieldKey];
}

/**
 * Format field value based on field configuration
 */
function formatFieldValue(field: { type: string; formatter?: (value: any) => string }, value: any): string {
  if (value === null || value === undefined) return '';
  
  if (field.formatter) {
    return field.formatter(value);
  }

  switch (field.type) {
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toLocaleDateString();
      }
      return String(value);
    
    case 'number':
      return typeof value === 'number' ? value.toString() : String(value);
    
    case 'boolean':
      return value ? 'Yes' : 'No';
    
    default:
      return String(value);
  }
}

/**
 * Get badge severity based on field and value
 */
function getBadgeSeverity(fieldKey: string, value: any): string {
  switch (fieldKey) {
    case 'homebrew':
      return value ? 'info' : 'secondary';
    case 'cost':
      if (typeof value === 'number') {
        if (value === 0) return 'success';
        if (value <= 2) return 'info';
        if (value <= 4) return 'warning';
        return 'danger';
      }
      return 'secondary';
    default:
      return 'secondary';
  }
}

/**
 * Render markdown content
 */
function renderMarkdown(text: any): string {
  if (!text) return '';
  const content = String(text);
  return marked.parse(content);
}

/**
 * Check if field should be treated as markdown
 */
function isMarkdownField(key: string): boolean {
  const markdownFields = ['description', 'notes', 'details', 'content'];
  return markdownFields.some(field => key.toLowerCase().includes(field));
}

/**
 * Format field name for display (fallback when no sections provided)
 */
function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
</script>

<style scoped>
.detail-modal :deep(.p-dialog-header) {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.detail-modal :deep(.p-dialog-content) {
  padding: 0;
}

.detail-modal-content {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-section {
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  overflow: hidden;
}

.section-title {
  background: var(--surface-50);
  padding: 1rem 1.5rem;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  border-bottom: 1px solid var(--surface-border);
}

.section-content {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-weight: 600;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-value {
  color: var(--text-color);
}

.field-text {
  font-size: 0.95rem;
  line-height: 1.5;
}

.text-muted {
  color: var(--text-color-secondary);
  font-style: italic;
}

.markdown-content {
  background: var(--surface-50);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  padding: 1rem;
  line-height: 1.6;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child),
.markdown-content :deep(h4:first-child),
.markdown-content :deep(h5:first-child),
.markdown-content :deep(h6:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(code) {
  background: var(--surface-100);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.markdown-content :deep(pre) {
  background: var(--surface-100);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-color-secondary);
  font-style: italic;
}

.fallback-content .section-content {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-modal :deep(.p-dialog-header) {
    padding: 1rem;
  }
  
  .detail-modal-content {
    padding: 1rem;
    max-height: 75vh;
  }
  
  .section-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .field-full-width {
    grid-column: 1;
  }
  
  .section-title {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
  
  /* Touch-friendly button sizing */
  .detail-modal :deep(.p-dialog-header .p-button) {
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0.5rem;
    margin: 0 0.125rem;
  }
  
  /* Improve button touch targets and spacing */
  .detail-modal :deep(.p-dialog-header) .flex {
    gap: 0.5rem;
  }
  
  /* Improve markdown content readability on mobile */
  .markdown-content {
    padding: 0.75rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .field-text {
    font-size: 0.9rem;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .field-label {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
  
  /* Better mobile modal positioning */
  .detail-modal :deep(.p-dialog) {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    border-radius: 0.75rem;
  }
  
  /* Optimize modal header for mobile */
  .detail-modal :deep(.p-dialog-header) {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;
    border-bottom: 1px solid var(--surface-border);
    border-radius: 0.75rem 0.75rem 0 0;
  }
  
  /* Improve touch scrolling */
  .detail-modal-content {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* Better section spacing on mobile */
  .detail-section {
    margin-bottom: 1rem;
  }
  
  .detail-section:last-child {
    margin-bottom: 0;
  }
  
  /* Improve field value display on mobile */
  .field-value {
    min-height: 1.5rem;
    display: flex;
    align-items: flex-start;
  }
  
  /* Better badge and tag sizing on mobile */
  .detail-modal :deep(.p-badge),
  .detail-modal :deep(.p-tag) {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
  }
}

@media (max-width: 480px) {
  .detail-modal :deep(.p-dialog) {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
    display: flex;
    flex-direction: column;
  }
  
  .detail-modal :deep(.p-dialog-header) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.75rem;
    flex-shrink: 0;
  }
  
  .detail-modal :deep(.p-dialog-header) .flex {
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
  
  .detail-modal :deep(.p-dialog-header) h3 {
    font-size: 1.1rem;
    line-height: 1.3;
    margin: 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: calc(100% - 8rem); /* Account for button space */
  }
  
  .detail-modal-content {
    padding: 0.75rem;
    max-height: calc(80vh - 4rem);
    flex: 1;
    overflow-y: auto;
  }
  
  .section-content {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .section-title {
    padding: 0.5rem 0.75rem;
    font-size: 0.95rem;
  }
  
  /* Extra touch-friendly buttons on very small screens */
  .detail-modal :deep(.p-dialog-header .p-button) {
    min-width: 2.75rem;
    min-height: 2.75rem;
    flex-shrink: 0;
  }
  
  /* Optimize markdown content for small screens */
  .markdown-content {
    padding: 0.5rem;
    font-size: 0.85rem;
    border-radius: 4px;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .markdown-content :deep(h1),
  .markdown-content :deep(h2),
  .markdown-content :deep(h3),
  .markdown-content :deep(h4),
  .markdown-content :deep(h5),
  .markdown-content :deep(h6) {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .markdown-content :deep(p) {
    margin-bottom: 0.75rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .markdown-content :deep(ul),
  .markdown-content :deep(ol) {
    padding-left: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .field-text {
    font-size: 0.85rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
    line-height: 1.4;
  }
  
  .field-label {
    font-size: 0.75rem;
  }
  
  /* Improve button layout on very small screens */
  .detail-modal :deep(.p-dialog-header) .flex:last-child {
    gap: 0.25rem;
    flex-wrap: wrap;
  }
  
  /* Better field value display */
  .field-value {
    min-height: 1.25rem;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  /* Optimize badges and tags for small screens */
  .detail-modal :deep(.p-badge),
  .detail-modal :deep(.p-tag) {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
    text-align: center;
  }
}

/* Improve scrolling behavior on mobile */
@media (max-width: 768px) {
  .detail-modal-content {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* Add subtle scroll indicators */
  .detail-modal-content::-webkit-scrollbar {
    width: 4px;
  }
  
  .detail-modal-content::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .detail-modal-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
  
  .detail-modal-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

/* Focus states for better accessibility */
.detail-modal :deep(.p-dialog-header .p-button:focus-visible) {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Improve badge and tag visibility on mobile */
@media (max-width: 768px) {
  .detail-modal :deep(.p-badge),
  .detail-modal :deep(.p-tag) {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>