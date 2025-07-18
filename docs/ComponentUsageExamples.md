# Component Usage Examples

This document provides comprehensive examples of how to use the optimized table components in different scenarios.

## Table of Contents

1. [Basic Implementation](#basic-implementation)
2. [Advanced Features](#advanced-features)
3. [Responsive Design Examples](#responsive-design-examples)
4. [Integration Patterns](#integration-patterns)
5. [Error Handling](#error-handling)
6. [Performance Optimization](#performance-optimization)

## Basic Implementation

### Simple Data Display

```vue
<template>
  <div class="page-container">
    <h1>Common Actions</h1>
    <OptimizedDataTable
      :data="commonActions"
      data-type="commonActions"
      @view-item="openDetailModal"
      @edit-item="openEditModal"
      @delete-item="confirmDelete"
    />
    
    <!-- Detail Modal -->
    <DetailModal
      v-model:visible="detailModalVisible"
      :item="selectedItem"
      data-type="commonActions"
    />
    
    <!-- Edit Modal -->
    <EditModal
      v-model:visible="editModalVisible"
      :item="selectedItem"
      data-type="commonActions"
      @save="handleSave"
    />
    
    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      v-model:visible="confirmDialogVisible"
      :message="confirmMessage"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import OptimizedDataTable from '~/components/OptimizedDataTable.vue'
import DetailModal from '~/components/DetailModal.vue'
import EditModal from '~/components/EditModal.vue'
import ConfirmationDialog from '~/components/ConfirmationDialog.vue'

// Data
const commonActions = ref([])
const selectedItem = ref(null)

// Modal states
const detailModalVisible = ref(false)
const editModalVisible = ref(false)
const confirmDialogVisible = ref(false)
const confirmMessage = ref('')

// Load data
onMounted(async () => {
  try {
    const response = await $fetch('/api/common-actions')
    commonActions.value = response
  } catch (error) {
    console.error('Failed to load common actions:', error)
  }
})

// Event handlers
const openDetailModal = (item) => {
  selectedItem.value = item
  detailModalVisible.value = true
}

const openEditModal = (item) => {
  selectedItem.value = { ...item } // Clone for editing
  editModalVisible.value = true
}

const confirmDelete = (item) => {
  selectedItem.value = item
  confirmMessage.value = `Are you sure you want to delete "${item.name}"?`
  confirmDialogVisible.value = true
}

const handleSave = async (updatedItem) => {
  try {
    await $fetch(`/api/common-actions/${updatedItem.id}`, {
      method: 'PUT',
      body: updatedItem
    })
    
    // Update local data
    const index = commonActions.value.findIndex(item => item.id === updatedItem.id)
    if (index !== -1) {
      commonActions.value[index] = updatedItem
    }
    
    editModalVisible.value = false
  } catch (error) {
    console.error('Failed to save item:', error)
  }
}

const handleDelete = async () => {
  try {
    await $fetch(`/api/common-actions/${selectedItem.value.id}`, {
      method: 'DELETE'
    })
    
    // Remove from local data
    commonActions.value = commonActions.value.filter(
      item => item.id !== selectedItem.value.id
    )
    
    confirmDialogVisible.value = false
  } catch (error) {
    console.error('Failed to delete item:', error)
  }
}
</script>
```

## Advanced Features

### Search and Filter Implementation

```vue
<template>
  <div class="advanced-table-container">
    <div class="table-controls">
      <div class="search-section">
        <InputText
          v-model="searchQuery"
          placeholder="Search all fields..."
          @input="handleSearch"
        />
      </div>
      
      <div class="filter-section">
        <Dropdown
          v-model="selectedType"
          :options="typeOptions"
          placeholder="Filter by type"
          @change="handleFilter"
        />
        
        <Dropdown
          v-model="selectedSource"
          :options="sourceOptions"
          placeholder="Filter by source"
          @change="handleFilter"
        />
        
        <Button
          label="Clear Filters"
          severity="secondary"
          @click="clearFilters"
        />
      </div>
    </div>
    
    <OptimizedDataTable
      :data="filteredData"
      data-type="commonActions"
      :loading="isLoading"
      searchable
      filterable
      sortable
      @view-item="handleView"
      @edit-item="handleEdit"
      @delete-item="handleDelete"
      @sort="handleSort"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'

// Data and state
const allData = ref([])
const searchQuery = ref('')
const selectedType = ref(null)
const selectedSource = ref(null)
const sortConfig = ref({ field: null, order: null })
const isLoading = ref(false)

// Options for filters
const typeOptions = computed(() => {
  const types = [...new Set(allData.value.map(item => item.type))]
  return types.map(type => ({ label: type, value: type }))
})

const sourceOptions = computed(() => {
  const sources = [...new Set(allData.value.map(item => item.source))]
  return sources.map(source => ({ label: source, value: source }))
})

// Filtered and sorted data
const filteredData = computed(() => {
  let result = allData.value

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(query)
      )
    })
  }

  // Apply filters
  if (selectedType.value) {
    result = result.filter(item => item.type === selectedType.value)
  }

  if (selectedSource.value) {
    result = result.filter(item => item.source === selectedSource.value)
  }

  // Apply sorting
  if (sortConfig.value.field) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortConfig.value.field]
      const bVal = b[sortConfig.value.field]
      
      if (sortConfig.value.order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })
  }

  return result
})

// Debounced search handler
const handleSearch = debounce((event) => {
  searchQuery.value = event.target.value
}, 300)

// Filter handlers
const handleFilter = () => {
  // Filters are reactive through computed property
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = null
  selectedSource.value = null
  sortConfig.value = { field: null, order: null }
}

const handleSort = (config) => {
  sortConfig.value = config
}

// Action handlers
const handleView = (item) => {
  // Implementation
}

const handleEdit = (item) => {
  // Implementation
}

const handleDelete = (item) => {
  // Implementation
}
</script>

<style scoped>
.advanced-table-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-section);
  border-radius: 6px;
}

.search-section {
  display: flex;
  gap: 0.5rem;
}

.filter-section {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (min-width: 768px) {
  .table-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
```

### Pagination Implementation

```vue
<template>
  <div class="paginated-table">
    <OptimizedDataTable
      :data="paginatedData"
      data-type="rules"
      :loading="isLoading"
    />
    
    <Paginator
      v-model:first="first"
      :rows="rows"
      :total-records="totalRecords"
      :rows-per-page-options="[10, 20, 50]"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      @page="onPageChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Pagination state
const first = ref(0)
const rows = ref(20)
const totalRecords = ref(0)
const allData = ref([])
const isLoading = ref(false)

// Computed paginated data
const paginatedData = computed(() => {
  const start = first.value
  const end = start + rows.value
  return allData.value.slice(start, end)
})

// Load data
const loadData = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/rules')
    allData.value = response
    totalRecords.value = response.length
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

// Page change handler
const onPageChange = (event) => {
  first.value = event.first
  rows.value = event.rows
}

// Watch for changes that require data reload
watch([first, rows], () => {
  // If using server-side pagination, reload data here
  // loadData()
})

onMounted(() => {
  loadData()
})
</script>
```

## Responsive Design Examples

### Mobile-First Implementation

```vue
<template>
  <div class="responsive-container">
    <!-- Mobile Header -->
    <div class="mobile-header" v-if="isMobile">
      <h2>{{ pageTitle }}</h2>
      <Button
        icon="pi pi-plus"
        severity="success"
        @click="openAddModal"
      />
    </div>
    
    <!-- Desktop Header -->
    <div class="desktop-header" v-else>
      <h1>{{ pageTitle }}</h1>
      <div class="header-actions">
        <Button
          label="Add New"
          icon="pi pi-plus"
          severity="success"
          @click="openAddModal"
        />
        <Button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          @click="exportData"
        />
      </div>
    </div>
    
    <!-- Responsive Table -->
    <OptimizedDataTable
      :data="data"
      :data-type="dataType"
      :class="tableClasses"
      @view-item="handleView"
      @edit-item="handleEdit"
      @delete-item="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  dataType: {
    type: String,
    required: true
  },
  pageTitle: {
    type: String,
    required: true
  }
})

// Responsive state
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value <= 768)
const isTablet = computed(() => windowWidth.value > 768 && windowWidth.value <= 1024)

// Table classes based on screen size
const tableClasses = computed(() => ({
  'table-mobile': isMobile.value,
  'table-tablet': isTablet.value,
  'table-desktop': !isMobile.value && !isTablet.value
}))

// Resize handler
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.responsive-container {
  padding: 1rem;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.desktop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.table-mobile {
  font-size: 0.875rem;
}

.table-tablet {
  font-size: 0.9rem;
}

.table-desktop {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .responsive-container {
    padding: 0.5rem;
  }
}
</style>
```

## Integration Patterns

### Composable Integration

```typescript
// composables/useOptimizedTable.ts
import { ref, computed } from 'vue'
import type { DataType } from '~/types/table-data-optimization'

export function useOptimizedTable(dataType: DataType) {
  // State
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedItems = ref([])
  
  // Modals
  const detailModalVisible = ref(false)
  const editModalVisible = ref(false)
  const confirmDialogVisible = ref(false)
  const selectedItem = ref(null)
  
  // Search and filters
  const searchQuery = ref('')
  const filters = ref({})
  const sortConfig = ref({ field: null, order: null })
  
  // Computed
  const filteredData = computed(() => {
    let result = data.value
    
    // Apply search
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(query)
        )
      )
    }
    
    // Apply filters
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => item[key] === value)
      }
    })
    
    return result
  })
  
  // Methods
  const loadData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/${dataType}`)
      data.value = response
    } catch (err) {
      error.value = err
      console.error(`Failed to load ${dataType}:`, err)
    } finally {
      loading.value = false
    }
  }
  
  const handleView = (item) => {
    selectedItem.value = item
    detailModalVisible.value = true
  }
  
  const handleEdit = (item) => {
    selectedItem.value = { ...item }
    editModalVisible.value = true
  }
  
  const handleDelete = (item) => {
    selectedItem.value = item
    confirmDialogVisible.value = true
  }
  
  const handleSave = async (updatedItem) => {
    try {
      await $fetch(`/api/${dataType}/${updatedItem.id}`, {
        method: 'PUT',
        body: updatedItem
      })
      
      const index = data.value.findIndex(item => item.id === updatedItem.id)
      if (index !== -1) {
        data.value[index] = updatedItem
      }
      
      editModalVisible.value = false
    } catch (err) {
      console.error('Failed to save item:', err)
    }
  }
  
  const confirmDelete = async () => {
    try {
      await $fetch(`/api/${dataType}/${selectedItem.value.id}`, {
        method: 'DELETE'
      })
      
      data.value = data.value.filter(item => item.id !== selectedItem.value.id)
      confirmDialogVisible.value = false
    } catch (err) {
      console.error('Failed to delete item:', err)
    }
  }
  
  return {
    // State
    data,
    loading,
    error,
    selectedItems,
    filteredData,
    
    // Modals
    detailModalVisible,
    editModalVisible,
    confirmDialogVisible,
    selectedItem,
    
    // Search and filters
    searchQuery,
    filters,
    sortConfig,
    
    // Methods
    loadData,
    handleView,
    handleEdit,
    handleDelete,
    handleSave,
    confirmDelete
  }
}
```

### Using the Composable

```vue
<template>
  <div>
    <OptimizedDataTable
      :data="filteredData"
      data-type="commonActions"
      :loading="loading"
      @view-item="handleView"
      @edit-item="handleEdit"
      @delete-item="handleDelete"
    />
    
    <DetailModal
      v-model:visible="detailModalVisible"
      :item="selectedItem"
      data-type="commonActions"
    />
    
    <EditModal
      v-model:visible="editModalVisible"
      :item="selectedItem"
      data-type="commonActions"
      @save="handleSave"
    />
    
    <ConfirmationDialog
      v-model:visible="confirmDialogVisible"
      message="Are you sure you want to delete this item?"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOptimizedTable } from '~/composables/useOptimizedTable'

const {
  filteredData,
  loading,
  detailModalVisible,
  editModalVisible,
  confirmDialogVisible,
  selectedItem,
  loadData,
  handleView,
  handleEdit,
  handleDelete,
  handleSave,
  confirmDelete
} = useOptimizedTable('commonActions')

onMounted(() => {
  loadData()
})
</script>
```

## Error Handling

### Comprehensive Error Handling

```vue
<template>
  <div class="table-with-error-handling">
    <!-- Error Alert -->
    <Message
      v-if="error"
      severity="error"
      :closable="true"
      @close="clearError"
    >
      {{ error.message }}
    </Message>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p>Loading data...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!data.length && !loading" class="empty-state">
      <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary);"></i>
      <h3>No Data Available</h3>
      <p>There are no items to display at this time.</p>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="loadData"
      />
    </div>
    
    <!-- Table -->
    <OptimizedDataTable
      v-else
      :data="data"
      data-type="commonActions"
      @view-item="handleView"
      @edit-item="handleEdit"
      @delete-item="handleDelete"
      @error="handleTableError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

// State
const data = ref([])
const loading = ref(false)
const error = ref(null)

// Error handling
const handleTableError = (err) => {
  console.error('Table error:', err)
  toast.add({
    severity: 'error',
    summary: 'Table Error',
    detail: 'An error occurred while displaying the table data.',
    life: 5000
  })
}

const clearError = () => {
  error.value = null
}

// Data loading with error handling
const loadData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch('/api/common-actions')
    data.value = response
  } catch (err) {
    error.value = {
      message: err.message || 'Failed to load data. Please try again.',
      code: err.statusCode || 'UNKNOWN_ERROR'
    }
    
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: error.value.message,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

// Action handlers with error handling
const handleView = async (item) => {
  try {
    // View logic
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'View Error',
      detail: 'Failed to open item details.',
      life: 3000
    })
  }
}

const handleEdit = async (item) => {
  try {
    // Edit logic
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Edit Error',
      detail: 'Failed to open item for editing.',
      life: 3000
    })
  }
}

const handleDelete = async (item) => {
  try {
    // Delete logic
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Delete Error',
      detail: 'Failed to delete item.',
      life: 3000
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
}

.empty-state h3 {
  margin: 0;
  color: var(--text-color);
}

.empty-state p {
  margin: 0;
  color: var(--text-color-secondary);
}
</style>
```

## Performance Optimization

### Virtual Scrolling for Large Datasets

```vue
<template>
  <div class="performance-optimized-table">
    <VirtualScroller
      :items="data"
      :item-size="50"
      class="virtual-scroller"
    >
      <template #item="{ item, index }">
        <div class="virtual-row" :key="item.id">
          <OptimizedDataTable
            :data="[item]"
            data-type="commonActions"
            :show-header="index === 0"
            @view-item="handleView"
            @edit-item="handleEdit"
            @delete-item="handleDelete"
          />
        </div>
      </template>
    </VirtualScroller>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])

// Load large dataset
const loadLargeDataset = async () => {
  try {
    const response = await $fetch('/api/common-actions?limit=10000')
    data.value = response
  } catch (error) {
    console.error('Failed to load large dataset:', error)
  }
}

onMounted(() => {
  loadLargeDataset()
})
</script>

<style scoped>
.virtual-scroller {
  height: 400px;
}

.virtual-row {
  border-bottom: 1px solid var(--surface-border);
}
</style>
```

These examples demonstrate the flexibility and power of the OptimizedDataTable component system. Each pattern can be adapted to specific use cases while maintaining consistency and performance across the application.