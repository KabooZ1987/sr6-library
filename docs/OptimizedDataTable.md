# OptimizedDataTable Component Documentation

## Overview

The `OptimizedDataTable` component is a streamlined, responsive data table designed to display only essential information while providing access to complete data through modals. It replaces the previous inconsistent table implementations across the application with a unified, optimized solution.

## Features

- **Essential Column Display**: Shows only 3-4 key columns for better readability
- **Responsive Design**: Adapts to different screen sizes with priority-based column visibility
- **Integrated Actions**: Built-in view, edit, and delete functionality
- **Search & Filter**: Comprehensive search across all fields, not just visible columns
- **Performance Optimized**: Efficient rendering with loading states and error handling
- **Consistent Behavior**: Unified interface across all data types

## Props

```typescript
interface OptimizedDataTableProps {
  data: Array<Record<string, any>>        // Array of data objects to display
  dataType: DataType                      // Type of data for column configuration
  loading?: boolean                       // Show loading state
  searchable?: boolean                    // Enable search functionality
  filterable?: boolean                    // Enable filter functionality
  sortable?: boolean                      // Enable sorting
  selectable?: boolean                    // Enable row selection
  paginated?: boolean                     // Enable pagination
  pageSize?: number                       // Number of rows per page
  emptyMessage?: string                   // Custom empty state message
}

type DataType = 'commonActions' | 'edgeActions' | 'edgeBoosts' | 'rules' | 'homebrew'
```

## Events

```typescript
interface OptimizedDataTableEvents {
  'view-item': (item: any) => void        // Emitted when view button is clicked
  'edit-item': (item: any) => void        // Emitted when edit button is clicked
  'delete-item': (item: any) => void      // Emitted when delete button is clicked
  'search': (query: string) => void       // Emitted when search input changes
  'filter': (filters: any) => void        // Emitted when filters change
  'sort': (sortConfig: any) => void       // Emitted when sorting changes
  'select': (selectedItems: any[]) => void // Emitted when selection changes
  'page-change': (page: number) => void   // Emitted when page changes
}
```

## Usage Examples

### Basic Usage

```vue
<template>
  <OptimizedDataTable
    :data="commonActions"
    data-type="commonActions"
    @view-item="handleView"
    @edit-item="handleEdit"
    @delete-item="handleDelete"
  />
</template>

<script setup>
import OptimizedDataTable from '~/components/OptimizedDataTable.vue'

const commonActions = ref([
  {
    id: 1,
    name: 'Aim',
    type: 'Simple',
    attribute: 'Agility',
    skill: 'Firearms',
    description: 'Take careful aim at your target',
    source: 'Core Rulebook',
    page: 162,
    homebrew: false
  }
])

const handleView = (item) => {
  // Open detail modal
  console.log('Viewing:', item)
}

const handleEdit = (item) => {
  // Open edit modal
  console.log('Editing:', item)
}

const handleDelete = (item) => {
  // Show confirmation and delete
  console.log('Deleting:', item)
}
</script>
```

### With Search and Filters

```vue
<template>
  <OptimizedDataTable
    :data="filteredData"
    data-type="edgeActions"
    :loading="isLoading"
    searchable
    filterable
    @search="handleSearch"
    @filter="handleFilter"
  />
</template>

<script setup>
const searchQuery = ref('')
const filters = ref({})
const isLoading = ref(false)

const handleSearch = (query) => {
  searchQuery.value = query
  // Implement search logic
}

const handleFilter = (newFilters) => {
  filters.value = newFilters
  // Implement filter logic
}

const filteredData = computed(() => {
  // Apply search and filters to data
  return edgeActions.value.filter(item => {
    // Search logic
    if (searchQuery.value) {
      const searchLower = searchQuery.value.toLowerCase()
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchLower)
      )
    }
    return true
  })
})
</script>
```

### With Pagination

```vue
<template>
  <OptimizedDataTable
    :data="paginatedData"
    data-type="rules"
    paginated
    :page-size="20"
    @page-change="handlePageChange"
  />
</template>

<script setup>
const currentPage = ref(1)
const pageSize = ref(20)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allRules.value.slice(start, end)
})

const handlePageChange = (page) => {
  currentPage.value = page
}
</script>
```

## Data Type Configurations

### Common Actions
- **Essential Columns**: Name, Type + Attribute/Skill, Action Indicators, Homebrew Badge
- **Priority 1**: Name (always visible)
- **Priority 2**: Type + Attribute/Skill combination
- **Priority 3**: Action indicator icons
- **Priority 4**: Homebrew badge

### Edge Actions
- **Essential Columns**: Name, Edge Cost, Type, Restriction
- **Priority 1**: Name (always visible)
- **Priority 2**: Edge Cost
- **Priority 3**: Type
- **Priority 4**: Restriction/Availability

### Edge Boosts
- **Essential Columns**: Name, Cost, Effect Summary, Applicability
- **Priority 1**: Name (always visible)
- **Priority 2**: Cost
- **Priority 3**: Effect summary
- **Priority 4**: Applicability/Source

### Rules
- **Essential Columns**: Name, Category, Complexity, Source
- **Priority 1**: Name (always visible)
- **Priority 2**: Category
- **Priority 3**: Complexity
- **Priority 4**: Source reference

### Homebrew
- **Essential Columns**: Name, Type, Author, Created Date
- **Priority 1**: Name (always visible)
- **Priority 2**: Type
- **Priority 3**: Author
- **Priority 4**: Created date

## Responsive Behavior

### Mobile (≤375px)
- Shows only Priority 1-2 columns
- Actions collapsed into dropdown menu
- Touch-friendly button sizes (minimum 44px)
- Full-screen modals

### Tablet (376px-768px)
- Shows Priority 1-3 columns
- Icon buttons with tooltips
- Optimized modal sizing

### Desktop (≥769px)
- Shows all priority columns
- Full text action buttons
- Centered modals with max width

## Styling and Theming

The component uses CSS custom properties for theming:

```css
.optimized-data-table {
  --table-bg: var(--surface-ground);
  --table-border: var(--surface-border);
  --header-bg: var(--surface-section);
  --row-hover: var(--surface-hover);
  --text-color: var(--text-color);
  --primary-color: var(--primary-color);
}
```

### Dark Mode Support
The component automatically adapts to dark mode through CSS custom properties and PrimeVue's theme system.

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical tab order
- **High Contrast**: Supports high contrast modes
- **Screen Reader**: Compatible with screen readers

## Performance Considerations

### Optimization Features
- **Virtual Scrolling**: For large datasets (>100 rows)
- **Lazy Loading**: Non-essential data loaded on demand
- **Memoization**: Column configurations cached
- **Debounced Search**: Search input debounced to 300ms

### Best Practices
- Use pagination for datasets >50 items
- Implement server-side filtering for large datasets
- Consider virtual scrolling for >100 items
- Monitor performance with browser dev tools

## Testing

### Unit Tests
```bash
npm run test components/__tests__/OptimizedDataTable.test.ts
```

### Integration Tests
```bash
npm run test components/__tests__/UserWorkflows.integration.test.ts
```

### Visual Regression Tests
```bash
npm run test components/__tests__/VisualRegression.test.ts
```

## Migration Guide

### From DataTableWrapper
```vue
<!-- Before -->
<DataTableWrapper
  :data="data"
  :columns="allColumns"
  @row-select="handleSelect"
/>

<!-- After -->
<OptimizedDataTable
  :data="data"
  data-type="commonActions"
  @view-item="handleView"
  @edit-item="handleEdit"
/>
```

### From TableTools
```vue
<!-- Before -->
<TableTools
  :items="items"
  :show-all-columns="true"
  @edit="handleEdit"
/>

<!-- After -->
<OptimizedDataTable
  :data="items"
  data-type="edgeActions"
  @edit-item="handleEdit"
/>
```

## Troubleshooting

### Common Issues

**Q: Columns not showing correctly**
A: Verify the `dataType` prop matches your data structure and check column configuration service.

**Q: Search not working on hidden fields**
A: Ensure `searchableFields` in column configuration includes all desired fields.

**Q: Actions not responsive**
A: Check viewport meta tag and CSS breakpoint definitions.

**Q: Performance issues with large datasets**
A: Enable pagination or virtual scrolling for datasets >50 items.

### Debug Mode
Enable debug mode to see column configuration and performance metrics:

```vue
<OptimizedDataTable
  :data="data"
  data-type="commonActions"
  debug
/>
```

## API Reference

### Methods
```typescript
interface OptimizedDataTableMethods {
  refresh(): void                    // Refresh table data
  clearSelection(): void             // Clear selected rows
  selectAll(): void                  // Select all visible rows
  exportData(format: string): void   // Export table data
  resetFilters(): void               // Reset all filters
  focusSearch(): void                // Focus search input
}
```

### Slots
```vue
<OptimizedDataTable>
  <!-- Custom empty state -->
  <template #empty>
    <div>No data found</div>
  </template>
  
  <!-- Custom loading state -->
  <template #loading>
    <div>Loading...</div>
  </template>
  
  <!-- Custom header actions -->
  <template #header-actions>
    <Button label="Add New" />
  </template>
  
  <!-- Custom cell content -->
  <template #cell-name="{ item }">
    <strong>{{ item.name }}</strong>
  </template>
</OptimizedDataTable>
```

## Contributing

When contributing to the OptimizedDataTable component:

1. Follow the existing column configuration patterns
2. Maintain responsive behavior across all breakpoints
3. Add appropriate tests for new features
4. Update documentation for API changes
5. Ensure accessibility compliance

## Related Components

- [DetailModal](./DetailModal.md) - For displaying complete item details
- [QuickActionButtons](./QuickActionButtons.md) - For table row actions
- [ColumnConfigurationService](./ColumnConfigurationService.md) - For column management