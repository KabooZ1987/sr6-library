/**
 * Utility types and functions for handling table data transformations
 */

import type { 
  TableDataType, 
  CommonAction, 
  EdgeAction, 
  EdgeBoost, 
  Rule, 
  Homebrew 
} from './table-data-optimization';

/**
 * Type guards for different data types
 */
export function isCommonAction(item: TableDataType): item is CommonAction {
  return 'attribute' in item && 'skill' in item && 'type' in item;
}

export function isEdgeAction(item: TableDataType): item is EdgeAction {
  return 'cost' in item && 'restriction' in item && !('category' in item);
}

export function isEdgeBoost(item: TableDataType): item is EdgeBoost {
  return 'cost' in item && !('restriction' in item) && !('category' in item);
}

export function isRule(item: TableDataType): item is Rule {
  return 'category' in item && 'homebrew' in item;
}

export function isHomebrew(item: TableDataType): item is Homebrew {
  return 'category' in item && !('homebrew' in item);
}

/**
 * Data transformation utilities
 */
export class DataTransformationUtils {
  /**
   * Normalize data for consistent handling
   */
  static normalizeItem(item: any): TableDataType {
    return {
      ...item,
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      updated_at: item.updated_at ? new Date(item.updated_at) : new Date()
    };
  }

  /**
   * Extract searchable text from an item
   */
  static extractSearchableText(item: TableDataType, searchFields: string[]): string {
    return searchFields
      .map(field => {
        const value = item[field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object' && value instanceof Date) {
          return value.toLocaleDateString();
        }
        return String(value);
      })
      .join(' ')
      .toLowerCase();
  }

  /**
   * Sort items by field and order
   */
  static sortItems(
    items: TableDataType[], 
    field: string, 
    order: 'asc' | 'desc'
  ): TableDataType[] {
    return [...items].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      // Handle null/undefined values
      if (aVal === null || aVal === undefined) return order === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return order === 'asc' ? -1 : 1;
      
      // Handle different data types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.localeCompare(bVal);
        return order === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (aVal instanceof Date && bVal instanceof Date) {
        const comparison = aVal.getTime() - bVal.getTime();
        return order === 'asc' ? comparison : -comparison;
      }
      
      // Fallback to string comparison
      const aStr = String(aVal);
      const bStr = String(bVal);
      const comparison = aStr.localeCompare(bStr);
      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Filter items based on search query
   */
  static filterItems(
    items: TableDataType[], 
    searchQuery: string, 
    searchFields: string[]
  ): TableDataType[] {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const searchableText = this.extractSearchableText(item, searchFields);
      return searchableText.includes(query);
    });
  }

  /**
   * Apply column filters to items
   */
  static applyColumnFilters(
    items: TableDataType[], 
    filters: Record<string, any>
  ): TableDataType[] {
    return items.filter(item => {
      return Object.entries(filters).every(([field, filterValue]) => {
        if (!filterValue) return true;
        
        const itemValue = item[field];
        
        // Handle different filter types
        if (typeof filterValue === 'string') {
          return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
        }
        
        if (typeof filterValue === 'boolean') {
          return itemValue === filterValue;
        }
        
        if (typeof filterValue === 'number') {
          return itemValue === filterValue;
        }
        
        // Handle array filters (for multi-select)
        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }
        
        return true;
      });
    });
  }

  /**
   * Paginate items
   */
  static paginateItems(
    items: TableDataType[], 
    page: number, 
    rowsPerPage: number
  ): { items: TableDataType[]; totalPages: number } {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / rowsPerPage);
    
    return {
      items: paginatedItems,
      totalPages
    };
  }

  /**
   * Get unique values for a field (useful for filter options)
   */
  static getUniqueValues(items: TableDataType[], field: string): any[] {
    const values = items
      .map(item => item[field])
      .filter(value => value !== null && value !== undefined);
    
    return [...new Set(values)].sort();
  }

  /**
   * Export items to different formats
   */
  static exportToCSV(items: TableDataType[], columns: string[]): string {
    const headers = columns.join(',');
    const rows = items.map(item => 
      columns.map(col => {
        const value = item[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Export items to JSON
   */
  static exportToJSON(items: TableDataType[], columns?: string[]): string {
    const exportItems = columns 
      ? items.map(item => {
          const filtered: any = {};
          columns.forEach(col => {
            filtered[col] = item[col];
          });
          return filtered;
        })
      : items;
    
    return JSON.stringify(exportItems, null, 2);
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }

  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.timers.delete(label);
    return duration;
  }

  static measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    return fn().finally(() => {
      const duration = this.endTimer(label);
      console.debug(`${label} took ${duration.toFixed(2)}ms`);
    });
  }

  static measure<T>(label: string, fn: () => T): T {
    this.startTimer(label);
    try {
      return fn();
    } finally {
      const duration = this.endTimer(label);
      console.debug(`${label} took ${duration.toFixed(2)}ms`);
    }
  }
}