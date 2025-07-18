# Design Document

## Overview

The table data optimization feature will transform the current data presentation approach from showing all available fields to a streamlined interface that displays only essential information in tables, with complete details accessible through modals. This design leverages the existing PrimeVue DataTable component and modal system while introducing a new column configuration strategy and enhanced modal layouts.

The solution addresses the current inconsistencies in table implementations across pages (some using DataTableWrapper, others using TableTools) by providing a unified, optimized table component that can be configured for different data types while maintaining consistent behavior.

## Architecture

### Component Hierarchy
```
OptimizedDataTable (New)
├── PrimeVue DataTable (Enhanced)
├── QuickActionButtons (New)
├── DetailModal (Enhanced ViewModal)
├── EditModal (Enhanced existing)
└── ColumnConfigurationService (New)
```

### Data Flow
1. **Table Rendering**: OptimizedDataTable receives data and column configuration
2. **Column Selection**: ColumnConfigurationService determines essential columns for each data type
3. **Action Handling**: QuickActionButtons handle view/edit/delete operations
4. **Modal Display**: DetailModal shows complete data with organized layout
5. **Data Updates**: Changes flow back through existing API patterns

## Components and Interfaces

### OptimizedDataTable Component

**Purpose**: Main table component that replaces current table implementations

**Props**:
```typescript
interface OptimizedDataTableProps {
  data: Array<Record<string, any>>
  dataType: 'commonActions' | 'edgeActions' | 'edgeBoosts' | 'rules' | 'homebrew'
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
}
```

**Key Features**:
- Automatic column selection based on data type
- Integrated quick actions (view, edit, delete)
- Responsive design with mobile-first approach
- Built-in search and filter functionality
- Consistent styling across all implementations

### ColumnConfigurationService

**Purpose**: Centralized service to define essential columns for each data type

**Configuration Structure**:
```typescript
interface ColumnConfig {
  field: string
  header: string
  sortable: boolean
  width?: string
  priority: number // 1-4, determines visibility on smaller screens
  formatter?: (value: any) => string
}

interface DataTypeConfig {
  essentialColumns: ColumnConfig[]
  searchableFields: string[]
  sortableFields: string[]
}
```

**Data Type Configurations**:

*Common Actions*:
- Name (priority 1)
- Type + Attribute/Skill combined (priority 2)
- Action indicator icons (priority 3)
- Homebrew badge (priority 4)

*Edge Actions*:
- Name (priority 1)
- Edge Cost (priority 2)
- Restriction (priority 3)
- Quick description preview (priority 4)

*Edge Boosts*:
- Name (priority 1)
- Cost (priority 2)
- Effect summary (priority 3)
- Source (priority 4)

### DetailModal Component

**Purpose**: Enhanced modal for displaying complete entry information

**Features**:
- Organized field grouping (Basic Info, Details, Meta)
- Markdown rendering for description fields
- Responsive layout for different screen sizes
- Quick edit button integration
- Navigation between entries (previous/next)

**Layout Structure**:
```
Modal Header
├── Entry Name
├── Quick Actions (Edit, Delete)
└── Close Button

Modal Body
├── Essential Info Section
├── Detailed Information Section
├── Meta Information Section
└── Source/Reference Section
```

### QuickActionButtons Component

**Purpose**: Consistent action buttons for table rows

**Actions**:
- View (eye icon) - Opens DetailModal
- Edit (pencil icon) - Opens EditModal
- Delete (trash icon) - Shows confirmation dialog

**Responsive Behavior**:
- Desktop: All buttons visible
- Tablet: Icons only with tooltips
- Mobile: Dropdown menu with actions

## Data Models

### Enhanced Column Definition
```typescript
interface EnhancedColumn {
  field: string
  header: string
  sortable: boolean
  searchable: boolean
  priority: 1 | 2 | 3 | 4
  width?: string
  minWidth?: string
  formatter?: (value: any, row: any) => string
  component?: string // For custom cell components
}
```

### Modal Data Organization
```typescript
interface ModalSection {
  title: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'markdown' | 'badge' | 'number' | 'date'
    formatter?: (value: any) => string
  }>
}

interface ModalConfig {
  sections: ModalSection[]
  quickActions: string[]
}
```

## Error Handling

### Table Loading States
- Skeleton loading for initial data fetch
- Progressive loading for large datasets
- Error states with retry functionality
- Empty state messaging

### Modal Error Handling
- Graceful handling of missing data fields
- Fallback values for undefined properties
- Error boundaries for modal content
- Loading states for modal data

### Action Error Handling
- Confirmation dialogs for destructive actions
- Toast notifications for action results
- Rollback capability for failed operations
- Network error recovery

## Testing Strategy

### Unit Testing
- Column configuration service logic
- Data formatting and display functions
- Modal state management
- Action button functionality

### Integration Testing
- Table component with different data types
- Modal opening and closing flows
- Search and filter functionality
- Responsive behavior across breakpoints

### End-to-End Testing
- Complete user workflows (view, edit, delete)
- Cross-page consistency verification
- Mobile and desktop user experiences
- Performance with large datasets

### Visual Regression Testing
- Table layouts across different screen sizes
- Modal appearances and interactions
- Consistent styling across data types
- Dark/light theme compatibility

## Implementation Approach

### Phase 1: Core Components
1. Create OptimizedDataTable component
2. Implement ColumnConfigurationService
3. Enhance existing modal components
4. Create QuickActionButtons component

### Phase 2: Data Type Integration
1. Configure column definitions for each data type
2. Update existing pages to use OptimizedDataTable
3. Implement responsive behaviors
4. Add search and filter capabilities

### Phase 3: Enhancement and Polish
1. Add advanced features (sorting, pagination)
2. Implement performance optimizations
3. Add accessibility improvements
4. Conduct thorough testing and refinement

### Migration Strategy
- Gradual replacement of existing table implementations
- Maintain backward compatibility during transition
- Feature flags for controlled rollout
- Performance monitoring and optimization

## Performance Considerations

### Table Rendering
- Virtual scrolling for large datasets
- Lazy loading of non-essential data
- Memoization of column configurations
- Efficient re-rendering strategies

### Modal Performance
- Lazy loading of modal content
- Caching of frequently accessed data
- Optimized modal opening/closing animations
- Memory management for modal instances

### Search and Filter
- Debounced search input
- Client-side filtering for small datasets
- Server-side filtering for large datasets
- Indexed search for better performance