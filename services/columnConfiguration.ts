/**
 * Column Configuration Service
 * Provides centralized configuration for table columns across different data types
 */

export interface ColumnConfig {
  field: string;
  header: string;
  sortable: boolean;
  searchable: boolean;
  priority: 1 | 2 | 3 | 4; // 1 = highest priority (always visible), 4 = lowest priority (hidden on mobile)
  width?: string;
  minWidth?: string;
  formatter?: (value: any, row: any) => string;
  component?: string; // For custom cell components
}

export interface DataTypeConfig {
  essentialColumns: ColumnConfig[];
  searchableFields: string[];
  sortableFields: string[];
  modalSections: ModalSection[];
}

export interface ModalSection {
  title: string;
  fields: Array<{
    key: string;
    label: string;
    type: 'text' | 'markdown' | 'badge' | 'number' | 'date' | 'boolean';
    formatter?: (value: any) => string;
  }>;
}

export type DataType = 'commonActions' | 'edgeActions' | 'edgeBoosts' | 'rules' | 'homebrew';

/**
 * Column Configuration Service
 * Manages column definitions and configurations for different data types
 */
export class ColumnConfigurationService {
  private static instance: ColumnConfigurationService;
  private configurations: Map<DataType, DataTypeConfig> = new Map();

  private constructor() {
    this.initializeConfigurations();
  }

  public static getInstance(): ColumnConfigurationService {
    if (!ColumnConfigurationService.instance) {
      ColumnConfigurationService.instance = new ColumnConfigurationService();
    }
    return ColumnConfigurationService.instance;
  }

  /**
   * Get column configuration for a specific data type
   */
  public getColumnConfig(dataType: DataType): DataTypeConfig {
    const config = this.configurations.get(dataType);
    if (!config) {
      throw new Error(`No configuration found for data type: ${dataType}`);
    }
    return config;
  }

  /**
   * Get essential columns for table display
   */
  public getEssentialColumns(dataType: DataType): ColumnConfig[] {
    return this.getColumnConfig(dataType).essentialColumns;
  }

  /**
   * Get searchable fields for a data type
   */
  public getSearchableFields(dataType: DataType): string[] {
    return this.getColumnConfig(dataType).searchableFields;
  }

  /**
   * Get sortable fields for a data type
   */
  public getSortableFields(dataType: DataType): string[] {
    return this.getColumnConfig(dataType).sortableFields;
  }

  /**
   * Get modal sections configuration for detailed view
   */
  public getModalSections(dataType: DataType): ModalSection[] {
    return this.getColumnConfig(dataType).modalSections;
  }

  /**
   * Get columns filtered by priority for responsive display
   */
  public getColumnsByPriority(dataType: DataType, maxPriority: number): ColumnConfig[] {
    const columns = this.getEssentialColumns(dataType);
    return columns.filter(col => col.priority <= maxPriority);
  }

  /**
   * Initialize all data type configurations
   */
  private initializeConfigurations(): void {
    this.configurations.set('commonActions', this.createCommonActionsConfig());
    this.configurations.set('edgeActions', this.createEdgeActionsConfig());
    this.configurations.set('edgeBoosts', this.createEdgeBoostsConfig());
    this.configurations.set('rules', this.createRulesConfig());
    this.configurations.set('homebrew', this.createHomebrewConfig());
  } 
 /**
   * Common Actions configuration
   * Essential columns: name, type + attribute/skill, action indicators, homebrew badge
   */
  private createCommonActionsConfig(): DataTypeConfig {
    return {
      essentialColumns: [
        {
          field: 'name',
          header: 'Name',
          sortable: true,
          searchable: true,
          priority: 1,
          minWidth: '150px'
        },
        {
          field: 'type_attribute_skill',
          header: 'Type / Attribute + Skill',
          sortable: false, // This is a computed field, not sortable
          searchable: false, // Individual fields (type, attribute, skill) are searchable instead
          priority: 2,
          minWidth: '200px',
          formatter: (value: any, row: any) => {
            const type = row.type || '';
            const attribute = row.attribute || '';
            const skill = row.skill || '';
            return `${type} / ${attribute} + ${skill}`;
          }
        },
        {
          field: 'action_indicators',
          header: 'Action',
          sortable: false,
          searchable: false,
          priority: 3,
          width: '80px',
          formatter: (value: any, row: any) => {
            // Return action type indicators/icons
            return row.type || '';
          }
        },
        {
          field: 'homebrew',
          header: 'Homebrew',
          sortable: true,
          searchable: true,
          priority: 4,
          width: '100px',
          formatter: (value: any) => value ? 'Yes' : 'No'
        }
      ],
      searchableFields: ['name', 'description', 'attribute', 'skill', 'type', 'source'],
      sortableFields: ['name', 'type', 'attribute', 'skill', 'homebrew', 'updated_at'],
      modalSections: [
        {
          title: 'Basic Information',
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'type', label: 'Action Type', type: 'text' },
            { key: 'attribute', label: 'Attribute', type: 'text' },
            { key: 'skill', label: 'Skill', type: 'text' }
          ]
        },
        {
          title: 'Details',
          fields: [
            { key: 'description', label: 'Description', type: 'markdown' }
          ]
        },
        {
          title: 'Meta Information',
          fields: [
            { key: 'homebrew', label: 'Homebrew', type: 'boolean' },
            { key: 'source', label: 'Source', type: 'text' },
            { key: 'page', label: 'Page', type: 'number' },
            { key: 'updated_at', label: 'Last Updated', type: 'date' }
          ]
        }
      ]
    };
  }

  /**
   * Edge Actions configuration
   * Essential columns: name, edge cost, restriction, quick description
   */
  private createEdgeActionsConfig(): DataTypeConfig {
    return {
      essentialColumns: [
        {
          field: 'name',
          header: 'Name',
          sortable: true,
          searchable: true,
          priority: 1,
          minWidth: '150px'
        },
        {
          field: 'cost',
          header: 'Edge Cost',
          sortable: true,
          searchable: true,
          priority: 2,
          width: '100px',
          formatter: (value: any) => value ? `${value} Edge` : 'N/A'
        },
        {
          field: 'restriction',
          header: 'Restriction',
          sortable: true,
          searchable: true,
          priority: 3,
          minWidth: '120px'
        },
        {
          field: 'description_preview',
          header: 'Description',
          sortable: false,
          searchable: true,
          priority: 4,
          minWidth: '200px',
          formatter: (value: any, row: any) => {
            const desc = row.description || '';
            return desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
          }
        }
      ],
      searchableFields: ['name', 'description', 'restriction', 'source'],
      sortableFields: ['name', 'cost', 'restriction', 'updated_at'],
      modalSections: [
        {
          title: 'Basic Information',
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'cost', label: 'Edge Cost', type: 'number' },
            { key: 'restriction', label: 'Restriction', type: 'text' }
          ]
        },
        {
          title: 'Details',
          fields: [
            { key: 'description', label: 'Description', type: 'markdown' }
          ]
        },
        {
          title: 'Source Information',
          fields: [
            { key: 'source', label: 'Source', type: 'text' },
            { key: 'page', label: 'Page', type: 'number' },
            { key: 'updated_at', label: 'Last Updated', type: 'date' }
          ]
        }
      ]
    };
  }

  /**
   * Edge Boosts configuration
   * Essential columns: name, cost, effect summary, applicability
   */
  private createEdgeBoostsConfig(): DataTypeConfig {
    return {
      essentialColumns: [
        {
          field: 'name',
          header: 'Name',
          sortable: true,
          searchable: true,
          priority: 1,
          minWidth: '150px'
        },
        {
          field: 'cost',
          header: 'Cost',
          sortable: true,
          searchable: true,
          priority: 2,
          width: '80px',
          formatter: (value: any) => value ? `${value}` : 'N/A'
        },
        {
          field: 'effect_summary',
          header: 'Effect',
          sortable: false,
          searchable: true,
          priority: 3,
          minWidth: '200px',
          formatter: (value: any, row: any) => {
            const desc = row.description || '';
            return desc.length > 80 ? desc.substring(0, 80) + '...' : desc;
          }
        },
        {
          field: 'source',
          header: 'Source',
          sortable: true,
          searchable: true,
          priority: 4,
          width: '120px'
        }
      ],
      searchableFields: ['name', 'description', 'source'],
      sortableFields: ['name', 'cost', 'source', 'updated_at'],
      modalSections: [
        {
          title: 'Basic Information',
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'cost', label: 'Cost', type: 'number' }
          ]
        },
        {
          title: 'Details',
          fields: [
            { key: 'description', label: 'Description', type: 'markdown' }
          ]
        },
        {
          title: 'Source Information',
          fields: [
            { key: 'source', label: 'Source', type: 'text' },
            { key: 'page', label: 'Page', type: 'number' },
            { key: 'updated_at', label: 'Last Updated', type: 'date' }
          ]
        }
      ]
    };
  }  /**
 
  * Rules configuration
   * Essential columns: name, category, description preview, homebrew status
   */
  private createRulesConfig(): DataTypeConfig {
    return {
      essentialColumns: [
        {
          field: 'name',
          header: 'Name',
          sortable: true,
          searchable: true,
          priority: 1,
          minWidth: '150px'
        },
        {
          field: 'category',
          header: 'Category',
          sortable: true,
          searchable: true,
          priority: 2,
          width: '120px'
        },
        {
          field: 'description_preview',
          header: 'Description',
          sortable: false,
          searchable: true,
          priority: 3,
          minWidth: '200px',
          formatter: (value: any, row: any) => {
            const desc = row.description || '';
            return desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
          }
        },
        {
          field: 'homebrew',
          header: 'Homebrew',
          sortable: true,
          searchable: true,
          priority: 4,
          width: '100px',
          formatter: (value: any) => value ? 'Yes' : 'No'
        }
      ],
      searchableFields: ['name', 'description', 'category', 'source'],
      sortableFields: ['name', 'category', 'homebrew', 'updated_at'],
      modalSections: [
        {
          title: 'Basic Information',
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'category', label: 'Category', type: 'text' }
          ]
        },
        {
          title: 'Details',
          fields: [
            { key: 'description', label: 'Description', type: 'markdown' }
          ]
        },
        {
          title: 'Meta Information',
          fields: [
            { key: 'homebrew', label: 'Homebrew', type: 'boolean' },
            { key: 'source', label: 'Source', type: 'text' },
            { key: 'page', label: 'Page', type: 'number' },
            { key: 'updated_at', label: 'Last Updated', type: 'date' }
          ]
        }
      ]
    };
  }

  /**
   * Homebrew configuration
   * Essential columns: name, category, description preview, date
   */
  private createHomebrewConfig(): DataTypeConfig {
    return {
      essentialColumns: [
        {
          field: 'name',
          header: 'Name',
          sortable: true,
          searchable: true,
          priority: 1,
          minWidth: '150px'
        },
        {
          field: 'category',
          header: 'Category',
          sortable: true,
          searchable: true,
          priority: 2,
          width: '120px'
        },
        {
          field: 'description_preview',
          header: 'Description',
          sortable: false,
          searchable: true,
          priority: 3,
          minWidth: '200px',
          formatter: (value: any, row: any) => {
            const desc = row.description || '';
            return desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
          }
        },
        {
          field: 'updated_at',
          header: 'Last Updated',
          sortable: true,
          searchable: false,
          priority: 4,
          width: '120px',
          formatter: (value: any) => {
            if (!value) return 'N/A';
            const date = new Date(value);
            return date.toLocaleDateString();
          }
        }
      ],
      searchableFields: ['name', 'description', 'category'],
      sortableFields: ['name', 'category', 'updated_at'],
      modalSections: [
        {
          title: 'Basic Information',
          fields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'category', label: 'Category', type: 'text' }
          ]
        },
        {
          title: 'Details',
          fields: [
            { key: 'description', label: 'Description', type: 'markdown' }
          ]
        },
        {
          title: 'Meta Information',
          fields: [
            { key: 'updated_at', label: 'Last Updated', type: 'date' }
          ]
        }
      ]
    };
  }
}

// Export singleton instance
export const columnConfigurationService = ColumnConfigurationService.getInstance();