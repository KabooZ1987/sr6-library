<template>
  <div class="optimized-data-table">
    <!-- Error Boundary -->
    <ErrorBoundary
      :fallback-title="'Table Loading Error'"
      :fallback-message="'Failed to load table data. Please try again.'"
      :show-details="false"
      @retry="handleRetry"
      @error="handleError"
    >
      <!-- Loading State with Skeleton -->
      <div v-if="loading" class="loading-container">
        <div class="loading-header">
          <div class="skeleton-search"></div>
          <div class="skeleton-buttons">
            <div class="skeleton-button" v-for="i in 2" :key="i"></div>
          </div>
        </div>
        <div class="loading-skeleton">
          <div class="skeleton-table-header">
            <div 
              class="skeleton-header-cell" 
              v-for="j in Math.min(visibleColumns.length + 1, 4)" 
              :key="j"
            ></div>
          </div>
          <div class="skeleton-row" v-for="i in skeletonRows" :key="i">
            <div 
              class="skeleton-cell" 
              v-for="j in Math.min(visibleColumns.length + 1, 4)" 
              :key="j"
            ></div>
          </div>
        </div>
        <div class="loading-footer">
          <div class="skeleton-pagination">
            <div class="skeleton-page-info"></div>
            <div class="skeleton-page-buttons">
              <div class="skeleton-page-btn" v-for="i in 3" :key="i"></div>
            </div>
          </div>
        </div>
      </div>

    <!-- Data Table -->
    <DataTable
      v-else
      :value="filteredData"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :sortField="defaultSortField"
      :sortOrder="defaultSortOrder"
      :globalFilterFields="searchableFields"
      v-model:filters="filters"
      :filterDisplay="filterable ? 'menu' : undefined"
      dataKey="id"
      :responsive="true"
      :class="tableClasses"
      @row-click="onRowClick"
    >
      <!-- Global Search and Advanced Filters -->
      <template #header v-if="searchable || filterable">
        <div class="table-header">
          <div class="search-container" v-if="searchable">
            <IconField iconPosition="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="globalFilter"
                :placeholder="`Search all ${dataType} fields...`"
                class="search-input"
                @input="onGlobalSearch"
              />
            </IconField>
          </div>
          <div class="filter-controls" v-if="filterable">
            <Button
              icon="pi pi-filter"
              :label="showAdvancedFilters ? 'Hide Filters' : 'Show Filters'"
              @click="toggleAdvancedFilters"
              class="filter-toggle-btn"
              size="small"
              outlined
            />
            <Button
              icon="pi pi-filter-slash"
              label="Clear All"
              @click="clearAllFilters"
              class="clear-filters-btn"
              size="small"
              severity="secondary"
              outlined
            />
          </div>
        </div>
        
        <!-- Advanced Filter Panel -->
        <div v-if="showAdvancedFilters && filterable" class="advanced-filters">
          <div class="filter-grid">
            <div 
              v-for="field in searchableFields" 
              :key="field"
              class="filter-field"
            >
              <label :for="`filter-${field}`" class="filter-label">
                {{ getFieldLabel(field) }}
              </label>
              <InputText
                :id="`filter-${field}`"
                v-model="advancedFilters[field]"
                :placeholder="`Filter by ${getFieldLabel(field)}`"
                class="filter-input"
                @input="onAdvancedFilterChange"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Dynamic Columns -->
      <Column
        v-for="column in visibleColumns"
        :key="column.field"
        :field="column.field"
        :header="column.header"
        :sortable="column.sortable"
        :style="getColumnStyle(column)"
        :class="getColumnClass(column)"
      >
        <template #body="slotProps">
          <div class="cell-content">
            {{ formatCellValue(column, slotProps.data) }}
          </div>
        </template>
        
        <template #filter="{ filterModel, filterCallback }" v-if="filterable && column.searchable">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            :placeholder="`Search ${column.header}`"
            class="column-filter"
          />
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Actions" :exportable="false" class="actions-column">
        <template #body="slotProps">
          <div class="action-buttons">
            <Button
              icon="pi pi-eye"
              severity="info"
              text
              rounded
              @click="handleView(slotProps.data)"
              v-tooltip.top="'View Details'"
              class="action-btn view-btn"
            />
            <Button
              icon="pi pi-pencil"
              severity="warning"
              text
              rounded
              @click="handleEdit(slotProps.data)"
              v-tooltip.top="'Edit'"
              class="action-btn edit-btn"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="handleDelete(slotProps.data)"
              v-tooltip.top="'Delete'"
              class="action-btn delete-btn"
            />
          </div>
        </template>
      </Column>

      <!-- Empty State -->
      <template #empty>
        <div class="empty-state">
          <i class="pi pi-info-circle empty-icon"></i>
          <p class="empty-message">No {{ dataType }} found.</p>
        </div>
      </template>
    </DataTable>
    
    <!-- Confirmation Dialog -->
    <ConfirmationDialog group="table-actions" />
    
    <!-- Toast Container -->
    <Toast group="table-notifications" position="top-right" />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfirm } from 'primevue/useconfirm'
import { columnConfigurationService, type DataType, type ColumnConfig } from '~/services/columnConfiguration'
import { useToastService } from '~/services/toastService'

// Props Interface
interface OptimizedDataTableProps {
  data: Array<Record<string, any>>
  dataType: DataType
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
}

// Props
const props = withDefaults(defineProps<OptimizedDataTableProps>(), {
  loading: false,
  searchable: true,
  filterable: true
})

// Emits
const emit = defineEmits<{
  view: [item: Record<string, any>]
  edit: [item: Record<string, any>]
  delete: [item: Record<string, any>]
  'row-click': [item: Record<string, any>]
  retry: []
}>()

// Services
const confirm = useConfirm()
const toastService = useToastService()

// Reactive Data
const globalFilter = ref('')
const filters = ref({})
const screenSize = ref('desktop')
const showAdvancedFilters = ref(false)
const advancedFilters = ref<Record<string, string>>({})

// Skeleton Loading Configuration
const skeletonRows = computed(() => {
  switch (screenSize.value) {
    case 'mobile-xs':
      return 3
    case 'mobile':
      return 4
    case 'tablet':
      return 5
    default:
      return 6
  }
})

// Column Configuration
const columnConfig = computed(() => {
  try {
    return columnConfigurationService.getColumnConfig(props.dataType)
  } catch (error) {
    console.error('Error getting column config:', error)
    return { essentialColumns: [], searchableFields: [], sortableFields: [] }
  }
})

// Responsive Column Visibility
const visibleColumns = computed(() => {
  const maxPriority = getMaxPriorityForScreen()
  return columnConfig.value.essentialColumns.filter(col => col.priority <= maxPriority)
})

// Searchable Fields - includes all fields that can be searched, not just visible ones
const searchableFields = computed(() => {
  return columnConfig.value.searchableFields || []
})

// Filtered Data - implements comprehensive search and filter functionality
const filteredData = computed(() => {
  let result = [...props.data]
  
  // Apply global search filter across all searchable fields
  if (globalFilter.value && globalFilter.value.trim()) {
    const searchTerm = globalFilter.value.toLowerCase().trim()
    result = result.filter(item => {
      return searchableFields.value.some(field => {
        const value = getNestedValue(item, field)
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm)
      })
    })
  }
  
  // Apply advanced filters (field-specific filters)
  Object.keys(advancedFilters.value).forEach(field => {
    const filterValue = advancedFilters.value[field]
    if (filterValue && filterValue.trim()) {
      const searchTerm = filterValue.toLowerCase().trim()
      result = result.filter(item => {
        const value = getNestedValue(item, field)
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm)
      })
    }
  })
  
  // Apply column-specific filters from PrimeVue DataTable
  const currentFilters = filters.value as Record<string, any>
  Object.keys(currentFilters).forEach(filterKey => {
    if (filterKey === 'global') return // Skip global filter as it's handled above
    
    const filterValue = currentFilters[filterKey]?.value
    if (filterValue && filterValue.trim()) {
      const searchTerm = filterValue.toLowerCase().trim()
      result = result.filter(item => {
        const value = getNestedValue(item, filterKey)
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(searchTerm)
      })
    }
  })
  
  return result
})

// Default Sort Configuration
const defaultSortField = computed(() => {
  const firstSortableColumn = visibleColumns.value.find(col => col.sortable)
  return firstSortableColumn?.field || 'name'
})

const defaultSortOrder = computed(() => 1) // 1 for ascending, -1 for descending

// Sortable Fields - all fields that can be sorted
const sortableFields = computed(() => {
  return columnConfig.value.sortableFields || []
})

// Table Classes
const tableClasses = computed(() => {
  return [
    'optimized-table',
    `table-${props.dataType}`,
    `screen-${screenSize.value}`
  ]
})

// Methods
function getMaxPriorityForScreen(): number {
  switch (screenSize.value) {
    case 'mobile-xs':
      return 1 // Show only priority 1 columns on extra small screens
    case 'mobile':
      return 2 // Show priority 1-2 columns on mobile
    case 'tablet':
      return 3 // Show priority 1-3 columns on tablet
    default:
      return 4 // Show all columns on desktop
  }
}

function getColumnStyle(column: ColumnConfig) {
  const styles: Record<string, string> = {}
  
  if (column.width) {
    styles.width = column.width
  }
  if (column.minWidth) {
    styles.minWidth = column.minWidth
  }
  
  return styles
}

function getColumnClass(column: ColumnConfig) {
  return [
    `column-${column.field}`,
    `priority-${column.priority}`,
    {
      'sortable-column': column.sortable,
      'searchable-column': column.searchable
    }
  ]
}

function formatCellValue(column: ColumnConfig, rowData: Record<string, any>): string {
  const value = rowData[column.field]
  
  if (column.formatter) {
    return column.formatter(value, rowData)
  }
  
  if (value === null || value === undefined) {
    return ''
  }
  
  return String(value)
}

function onGlobalSearch() {
  // Global search is handled by the filteredData computed property
  // This method can be used for additional search logic if needed
}

function toggleAdvancedFilters() {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

function clearAllFilters() {
  globalFilter.value = ''
  advancedFilters.value = {}
  
  // Clear PrimeVue filters
  const filterObj: Record<string, any> = {}
  if (props.searchable) {
    filterObj.global = { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
  if (props.filterable) {
    searchableFields.value.forEach(field => {
      filterObj[field] = { value: null, matchMode: FilterMatchMode.CONTAINS }
    })
  }
  filters.value = filterObj
}

function onAdvancedFilterChange() {
  // Advanced filters are handled by the filteredData computed property
  // This method can be used for additional filter logic if needed
}

function getFieldLabel(field: string): string {
  // Try to find the field in visible columns first
  const column = columnConfig.value.essentialColumns.find(col => col.field === field)
  if (column) {
    return column.header
  }
  
  // If not found, create a human-readable label from the field name
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null
  }, obj)
}

function onRowClick(event: any) {
  emit('row-click', event.data)
}

// Error Handling Methods
function handleError(error: Error, errorInfo: any) {
  console.error('OptimizedDataTable Error:', error, errorInfo)
  toastService.error(
    'Table Error',
    'An error occurred while loading the table. Please try again.',
    { life: 5000 }
  )
}

function handleRetry() {
  // Clear any error states and reinitialize
  initializeFilters()
  toastService.info('Retrying...', 'Reloading table data')
  // Emit retry event for parent component to handle
  emit('retry')
}

// Enhanced Action Handlers with Confirmation and Toast Notifications
function handleView(item: Record<string, any>) {
  try {
    emit('view', item)
    toastService.info('Opening Details', `Viewing ${item.name || 'entry'}`)
  } catch (error) {
    console.error('Error viewing item:', error)
    toastService.error('View Error', 'Failed to open details view')
  }
}

function handleEdit(item: Record<string, any>) {
  try {
    emit('edit', item)
    toastService.info('Opening Editor', `Editing ${item.name || 'entry'}`)
  } catch (error) {
    console.error('Error editing item:', error)
    toastService.error('Edit Error', 'Failed to open edit view')
  }
}

function handleDelete(item: Record<string, any>) {
  const itemName = item.name || 'this entry'
  
  confirm.require({
    group: 'table-actions',
    message: `Are you sure you want to delete "${itemName}"?`,
    header: 'Confirm Deletion',
    detail: 'This action cannot be undone.',
    icon: 'pi pi-exclamation-triangle',
    severity: 'danger',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    accept: () => {
      try {
        emit('delete', item)
        toastService.success(
          'Deleted Successfully',
          `${itemName} has been deleted`,
          { life: 3000 }
        )
      } catch (error) {
        console.error('Error deleting item:', error)
        toastService.error(
          'Delete Failed',
          `Failed to delete ${itemName}. Please try again.`,
          { life: 5000 }
        )
      }
    },
    reject: () => {
      toastService.info('Cancelled', 'Delete operation cancelled')
    }
  })
}

function updateScreenSize() {
  const width = window.innerWidth
  if (width <= 480) {
    screenSize.value = 'mobile-xs'
  } else if (width <= 767) {
    screenSize.value = 'mobile'
  } else if (width <= 1023) {
    screenSize.value = 'tablet'
  } else {
    screenSize.value = 'desktop'
  }
}

// Initialize filters
function initializeFilters() {
  const filterObj: Record<string, any> = {}
  
  if (props.searchable) {
    filterObj.global = { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
  
  if (props.filterable) {
    visibleColumns.value.forEach(column => {
      if (column.searchable) {
        filterObj[column.field] = { value: null, matchMode: FilterMatchMode.CONTAINS }
      }
    })
  }
  
  filters.value = filterObj
}

// Lifecycle
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
  initializeFilters()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})

// Watchers
watch(() => props.dataType, () => {
  initializeFilters()
})

watch(globalFilter, (newValue) => {
  const currentFilters = filters.value as Record<string, any>
  if (currentFilters.global) {
    currentFilters.global.value = newValue
  }
})
</script>

<style scoped>
.optimized-data-table {
  width: 100%;
}

/* Loading Container and Skeleton */
.loading-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
}

.skeleton-search {
  height: 2.5rem;
  flex: 1;
  max-width: 28rem;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-buttons {
  display: flex;
  gap: 0.5rem;
}

.skeleton-button {
  height: 2.5rem;
  width: 6rem;
  background-color: #e5e7eb;
  border-radius: 0.375rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.loading-skeleton {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.skeleton-table-header {
  display: flex;
  gap: 0;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.skeleton-header-cell {
  height: 3rem;
  background-color: #f3f4f6;
  border-right: 1px solid #e5e7eb;
  flex: 1;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  position: relative;
}

.skeleton-header-cell:last-child {
  border-right: none;
  width: 8rem;
  flex: none;
}

.skeleton-header-cell::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 1rem;
  right: 1rem;
  height: 1rem;
  background-color: #d1d5db;
  border-radius: 0.25rem;
  transform: translateY(-50%);
}

.skeleton-row {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #f3f4f6;
}

.skeleton-row:last-child {
  border-bottom: none;
}

.skeleton-cell {
  height: 3.5rem;
  background-color: white;
  border-right: 1px solid #f3f4f6;
  flex: 1;
  position: relative;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-cell:last-child {
  border-right: none;
  width: 8rem;
  flex: none;
}

.skeleton-cell::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 1rem;
  right: 1rem;
  height: 0.75rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  transform: translateY(-50%);
}

.skeleton-cell:last-child::before {
  left: 50%;
  right: auto;
  width: 4rem;
  transform: translate(-50%, -50%);
}

.loading-footer {
  padding: 1rem 0;
}

.skeleton-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-page-info {
  height: 1.5rem;
  width: 8rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-page-buttons {
  display: flex;
  gap: 0.25rem;
}

.skeleton-page-btn {
  height: 2rem;
  width: 2rem;
  background-color: #e5e7eb;
  border-radius: 0.25rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Mobile skeleton optimizations */
@media (max-width: 767px) {
  .loading-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .skeleton-search {
    max-width: none;
    height: 2.75rem;
  }
  
  .skeleton-buttons {
    justify-content: center;
  }
  
  .skeleton-button {
    flex: 1;
    min-height: 2.75rem;
  }
  
  .skeleton-header-cell {
    height: 2.5rem;
  }
  
  .skeleton-header-cell::before {
    height: 0.75rem;
  }
  
  .skeleton-cell {
    height: 3rem;
  }
  
  .skeleton-cell::before {
    height: 0.625rem;
  }
  
  .skeleton-pagination {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
  
  .skeleton-page-buttons {
    gap: 0.5rem;
  }
  
  .skeleton-page-btn {
    height: 2.75rem;
    width: 2.75rem;
  }
}

@media (max-width: 480px) {
  .loading-container {
    gap: 0.75rem;
  }
  
  .loading-header {
    padding: 0.75rem 0;
  }
  
  .skeleton-search {
    height: 2.75rem;
  }
  
  .skeleton-button {
    min-height: 2.75rem;
    font-size: 0.9rem;
  }
  
  .skeleton-header-cell:last-child,
  .skeleton-cell:last-child {
    width: 4rem;
  }
  
  .skeleton-cell:last-child::before {
    width: 2rem;
  }
}

/* Table Header */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.search-container {
  flex: 1;
  max-width: 28rem;
}

.search-input {
  width: 100%;
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

.filter-toggle-btn,
.clear-filters-btn {
  white-space: nowrap;
}

/* Advanced Filters */
.advanced-filters {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .filter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-input {
  font-size: 0.875rem;
}

/* Touch-friendly filter inputs on mobile */
@media (max-width: 767px) {
  .filter-input {
    min-height: 2.75rem;
    font-size: 1rem; /* Prevent zoom on iOS */
    padding: 0.75rem 1rem;
  }
  
  .advanced-filters {
    padding: 0.75rem;
  }
  
  .filter-grid {
    gap: 0.75rem;
  }
  
  .filter-field {
    gap: 0.5rem;
  }
  
  .filter-label {
    font-size: 0.8rem;
  }
}

/* Cell Content */
.cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  width: 2rem;
  height: 2rem;
  padding: 0;
}

/* Column Filters */
.column-filter {
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
}

.empty-message {
  font-size: 1.125rem;
}

/* Responsive Styles */
@media (max-width: 767px) {
  .optimized-data-table {
    font-size: 0.875rem;
  }
  
  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
  
  .filter-controls {
    margin-left: 0;
    justify-content: center;
  }
  
  .filter-toggle-btn,
  .clear-filters-btn {
    flex: 1;
    min-width: 0;
    min-height: 2.75rem; /* Touch-friendly height */
    font-size: 0.9rem;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .action-btn {
    width: 2.25rem;
    height: 2.25rem;
    min-width: 2.25rem;
  }
  
  /* Improve touch targets */
  :deep(.p-paginator-pages .p-paginator-page) {
    min-width: 2.75rem;
    min-height: 2.75rem;
    font-size: 0.9rem;
  }
  
  :deep(.p-dropdown-trigger) {
    min-width: 2.75rem;
    min-height: 2.75rem;
  }
  
  :deep(.p-paginator-first),
  :deep(.p-paginator-prev),
  :deep(.p-paginator-next),
  :deep(.p-paginator-last) {
    min-width: 2.75rem;
    min-height: 2.75rem;
  }
  
  /* Touch-friendly search input */
  .search-input {
    min-height: 2.75rem;
    font-size: 1rem; /* Prevent zoom on iOS */
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
  }
  
  /* Hide less important UI elements on very small screens */
  :deep(.p-datatable-paginator-bottom .p-paginator-rpp-options) {
    display: none;
  }
  
  /* Improve table scrolling on mobile */
  :deep(.p-datatable-wrapper) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    border-radius: 0.5rem;
  }
  
  /* Better mobile table styling */
  :deep(.p-datatable-table) {
    min-width: 100%;
  }
  
  :deep(.p-datatable-thead > tr > th) {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
    white-space: nowrap;
    min-height: 2.5rem;
    position: sticky;
    top: 0;
    background: var(--surface-0);
    z-index: 1;
  }
  
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
    min-height: 2.5rem;
    vertical-align: middle;
  }
  
  /* Optimize cell content for mobile */
  .cell-content {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Improve row selection and interaction */
  :deep(.p-datatable-tbody > tr) {
    cursor: pointer;
    transition: background-color 0.2s ease;
    min-height: 3rem; /* Ensure adequate touch target */
  }
  
  :deep(.p-datatable-tbody > tr:hover) {
    background-color: var(--surface-100);
  }
  
  :deep(.p-datatable-tbody > tr:active) {
    background-color: var(--surface-200);
    transform: scale(0.98);
    transition: all 0.1s ease;
  }
  
  /* Mobile-specific loading skeleton */
  .loading-skeleton {
    padding: 1rem;
  }
  
  .skeleton-row {
    margin-bottom: 0.75rem;
  }
  
  .skeleton-cell {
    height: 2.5rem;
    border-radius: 0.5rem;
  }
  
  /* Improve empty state on mobile */
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-icon {
    font-size: 2rem;
  }
  
  .empty-message {
    font-size: 1rem;
  }
  
  /* Enhanced mobile interactions */
  :deep(.p-datatable-tbody > tr:active) {
    background-color: var(--surface-200) !important;
    transform: scale(0.98);
    transition: all 0.1s ease;
  }
  
  /* Better visual feedback for touch */
  :deep(.p-button:active) {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
  
  /* Improve filter panel on mobile */
  .advanced-filters {
    margin: 0.5rem 0;
    padding: 0.75rem;
    border-radius: 0.75rem;
  }
  
  .filter-grid {
    gap: 0.75rem;
  }
  
  .filter-field {
    gap: 0.5rem;
  }
  
  .filter-label {
    font-size: 0.8rem;
  }
  
  .filter-input {
    min-height: 2.75rem;
    font-size: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .search-container {
    max-width: 20rem;
  }
  
  .action-btn {
    width: 2rem;
    height: 2rem;
  }
}

@media (min-width: 1024px) {
  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
  }
}

/* Priority-based column hiding with improved breakpoints */
@media (max-width: 480px) {
  /* Extra small screens - show only priority 1 columns */
  :deep(.priority-2),
  :deep(.priority-3),
  :deep(.priority-4) {
    display: none !important;
  }
  
  /* Adjust actions column width for mobile */
  :deep(.actions-column) {
    width: 4rem;
    min-width: 4rem;
  }
}

@media (min-width: 481px) and (max-width: 767px) {
  /* Small screens - show priority 1-2 columns */
  :deep(.priority-3),
  :deep(.priority-4) {
    display: none !important;
  }
  
  :deep(.actions-column) {
    width: 5rem;
    min-width: 5rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* Medium screens - show priority 1-3 columns */
  :deep(.priority-4) {
    display: none !important;
  }
  
  :deep(.actions-column) {
    width: 6rem;
    min-width: 6rem;
  }
}

@media (min-width: 1024px) {
  /* Large screens - show all columns */
  :deep(.actions-column) {
    width: 8rem;
    min-width: 8rem;
  }
}

/* Table Styling */
:deep(.p-datatable) {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

:deep(.p-datatable-header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable-tbody > tr:hover) {
  background-color: #f9fafb;
  cursor: pointer;
}

:deep(.actions-column) {
  width: 8rem;
  text-align: center;
}

:deep(.sortable-column .p-column-header-content) {
  cursor: pointer;
}
</style>