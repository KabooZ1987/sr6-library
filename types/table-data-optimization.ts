/**
 * Core interfaces for table data optimization
 * Defines the structure for responsive table configurations and data handling
 */

export interface TableItem {
  id: string;
  name: string;
  description?: string;
  updated_at?: Date | string;
  [key: string]: any;
}

export interface CommonAction extends TableItem {
  attribute: string;
  skill: string;
  type: string;
  page?: number;
  source?: string;
  homebrew: boolean;
}

export interface EdgeAction extends TableItem {
  cost: number;
  restriction: string;
  source: string;
  page: number;
}

export interface EdgeBoost extends TableItem {
  cost: number;
  source: string;
  page: number;
}

export interface Rule extends TableItem {
  category: string;
  page?: number;
  source?: string;
  homebrew: boolean;
}

export interface Homebrew extends TableItem {
  category: string;
}

export type TableDataType = CommonAction | EdgeAction | EdgeBoost | Rule | Homebrew;

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveConfig {
  mobile: {
    maxColumns: number;
    priorityThreshold: number;
  };
  tablet: {
    maxColumns: number;
    priorityThreshold: number;
  };
  desktop: {
    maxColumns: number;
    priorityThreshold: number;
  };
}

/**
 * Table configuration for different screen sizes
 */
export interface TableConfiguration {
  dataType: string;
  responsive: ResponsiveConfig;
  defaultSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination: {
    enabled: boolean;
    defaultRows: number;
    rowsPerPageOptions: number[];
  };
  search: {
    enabled: boolean;
    placeholder: string;
    debounceMs: number;
  };
}

/**
 * Search and filter configuration
 */
export interface SearchConfig {
  globalSearch: boolean;
  columnFilters: boolean;
  searchFields: string[];
  filterOperators: {
    text: ('contains' | 'startsWith' | 'endsWith' | 'equals')[];
    number: ('equals' | 'notEquals' | 'lt' | 'lte' | 'gt' | 'gte')[];
    date: ('dateIs' | 'dateIsNot' | 'dateBefore' | 'dateAfter')[];
    boolean: ('equals')[];
  };
}

/**
 * Performance optimization configuration
 */
export interface PerformanceConfig {
  virtualScrolling: {
    enabled: boolean;
    itemSize: number;
    threshold: number;
  };
  lazyLoading: {
    enabled: boolean;
    pageSize: number;
  };
  caching: {
    enabled: boolean;
    ttl: number; // Time to live in milliseconds
  };
}

/**
 * Complete table optimization configuration
 */
export interface TableOptimizationConfig {
  table: TableConfiguration;
  search: SearchConfig;
  performance: PerformanceConfig;
}

/**
 * Table state management interface
 */
export interface TableState {
  loading: boolean;
  data: TableDataType[];
  filteredData: TableDataType[];
  totalRecords: number;
  currentPage: number;
  rowsPerPage: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  globalFilter?: string;
  columnFilters: Record<string, any>;
  selectedItems: TableDataType[];
}

/**
 * Table action interface for CRUD operations
 */
export interface TableActions {
  onView: (item: TableDataType) => void;
  onEdit: (item: TableDataType) => void;
  onDelete: (item: TableDataType) => void;
  onAdd: () => void;
  onBulkDelete?: (items: TableDataType[]) => void;
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
}

/**
 * Table event handlers
 */
export interface TableEvents {
  onSort: (field: string, order: 'asc' | 'desc') => void;
  onFilter: (filters: Record<string, any>) => void;
  onPage: (page: number, rows: number) => void;
  onSearch: (query: string) => void;
  onSelectionChange: (selectedItems: TableDataType[]) => void;
  onRowClick?: (item: TableDataType, event: Event) => void;
  onRowDoubleClick?: (item: TableDataType, event: Event) => void;
}

/**
 * Column visibility and ordering configuration
 */
export interface ColumnVisibilityConfig {
  visibleColumns: string[];
  columnOrder: string[];
  hiddenColumns: string[];
  lockedColumns: string[]; // Columns that cannot be hidden
}

/**
 * Export configuration
 */
export interface ExportConfig {
  formats: ('csv' | 'json' | 'pdf' | 'excel')[];
  includeFiltered: boolean;
  includeSelected: boolean;
  customFields?: string[];
  filename?: string;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  ariaLabels: {
    table: string;
    sortButton: string;
    filterButton: string;
    searchInput: string;
    pagination: string;
  };
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
}

/**
 * Complete table component props interface
 */
export interface OptimizedTableProps {
  dataType: string;
  items: TableDataType[];
  loading?: boolean;
  configuration: TableOptimizationConfig;
  actions: TableActions;
  events: TableEvents;
  columnVisibility?: ColumnVisibilityConfig;
  exportConfig?: ExportConfig;
  accessibility?: AccessibilityConfig;
  className?: string;
  testId?: string;
}