import { describe, it, expect, beforeEach } from 'vitest'
import { 
  ColumnConfigurationService, 
  columnConfigurationService,
  type DataType,
  type ColumnConfig,
  type DataTypeConfig 
} from '../columnConfiguration'

describe('ColumnConfigurationService', () => {
  let service: ColumnConfigurationService

  beforeEach(() => {
    service = ColumnConfigurationService.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ColumnConfigurationService.getInstance()
      const instance2 = ColumnConfigurationService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should export a singleton instance', () => {
      expect(columnConfigurationService).toBeInstanceOf(ColumnConfigurationService)
    })
  })

  describe('Data Type Configurations', () => {
    const dataTypes: DataType[] = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew']

    dataTypes.forEach(dataType => {
      describe(`${dataType} configuration`, () => {
        let config: DataTypeConfig

        beforeEach(() => {
          config = service.getColumnConfig(dataType)
        })

        it('should have essential columns defined', () => {
          expect(config.essentialColumns).toBeDefined()
          expect(config.essentialColumns.length).toBeGreaterThan(0)
        })

        it('should have searchable fields defined', () => {
          expect(config.searchableFields).toBeDefined()
          expect(Array.isArray(config.searchableFields)).toBe(true)
        })

        it('should have sortable fields defined', () => {
          expect(config.sortableFields).toBeDefined()
          expect(Array.isArray(config.sortableFields)).toBe(true)
        })

        it('should have modal sections defined', () => {
          expect(config.modalSections).toBeDefined()
          expect(Array.isArray(config.modalSections)).toBe(true)
        })

        it('should have columns with valid priorities (1-4)', () => {
          config.essentialColumns.forEach(column => {
            expect(column.priority).toBeGreaterThanOrEqual(1)
            expect(column.priority).toBeLessThanOrEqual(4)
          })
        })

        it('should have at least one priority 1 column', () => {
          const priority1Columns = config.essentialColumns.filter(col => col.priority === 1)
          expect(priority1Columns.length).toBeGreaterThanOrEqual(1)
        })
      })
    })
  })

  describe('Common Actions Configuration', () => {
    let config: DataTypeConfig

    beforeEach(() => {
      config = service.getColumnConfig('commonActions')
    })

    it('should have name as first priority column', () => {
      const nameColumn = config.essentialColumns.find(col => col.field === 'name')
      expect(nameColumn).toBeDefined()
      expect(nameColumn?.priority).toBe(1)
    })

    it('should have type_attribute_skill column with formatter', () => {
      const typeColumn = config.essentialColumns.find(col => col.field === 'type_attribute_skill')
      expect(typeColumn).toBeDefined()
      expect(typeColumn?.formatter).toBeDefined()
    })

    it('should format type_attribute_skill correctly', () => {
      const typeColumn = config.essentialColumns.find(col => col.field === 'type_attribute_skill')
      const mockRow = { type: 'Major', attribute: 'Agility', skill: 'Firearms' }
      const result = typeColumn?.formatter?.(null, mockRow)
      expect(result).toBe('Major / Agility + Firearms')
    })

    it('should have homebrew column with boolean formatter', () => {
      const homebrewColumn = config.essentialColumns.find(col => col.field === 'homebrew')
      expect(homebrewColumn).toBeDefined()
      expect(homebrewColumn?.formatter).toBeDefined()
      expect(homebrewColumn?.formatter?.(true)).toBe('Yes')
      expect(homebrewColumn?.formatter?.(false)).toBe('No')
    })

    it('should include all expected searchable fields', () => {
      const expectedFields = ['name', 'description', 'attribute', 'skill', 'type', 'source']
      expectedFields.forEach(field => {
        expect(config.searchableFields).toContain(field)
      })
    })
  })

  describe('Edge Actions Configuration', () => {
    let config: DataTypeConfig

    beforeEach(() => {
      config = service.getColumnConfig('edgeActions')
    })

    it('should have cost column with edge formatter', () => {
      const costColumn = config.essentialColumns.find(col => col.field === 'cost')
      expect(costColumn).toBeDefined()
      expect(costColumn?.formatter).toBeDefined()
      expect(costColumn?.formatter?.(2)).toBe('2 Edge')
      expect(costColumn?.formatter?.(null)).toBe('N/A')
    })

    it('should have description preview with truncation', () => {
      const descColumn = config.essentialColumns.find(col => col.field === 'description_preview')
      expect(descColumn).toBeDefined()
      expect(descColumn?.formatter).toBeDefined()
      
      const longDescription = 'A'.repeat(150)
      const mockRow = { description: longDescription }
      const result = descColumn?.formatter?.(null, mockRow)
      expect(result).toBe('A'.repeat(100) + '...')
    })
  })

  describe('Edge Boosts Configuration', () => {
    let config: DataTypeConfig

    beforeEach(() => {
      config = service.getColumnConfig('edgeBoosts')
    })

    it('should have effect summary with truncation', () => {
      const effectColumn = config.essentialColumns.find(col => col.field === 'effect_summary')
      expect(effectColumn).toBeDefined()
      expect(effectColumn?.formatter).toBeDefined()
      
      const longDescription = 'B'.repeat(100)
      const mockRow = { description: longDescription }
      const result = effectColumn?.formatter?.(null, mockRow)
      expect(result).toBe('B'.repeat(80) + '...')
    })
  })

  describe('Rules Configuration', () => {
    let config: DataTypeConfig

    beforeEach(() => {
      config = service.getColumnConfig('rules')
    })

    it('should have category as priority 2 column', () => {
      const categoryColumn = config.essentialColumns.find(col => col.field === 'category')
      expect(categoryColumn).toBeDefined()
      expect(categoryColumn?.priority).toBe(2)
    })

    it('should have description preview with truncation', () => {
      const descColumn = config.essentialColumns.find(col => col.field === 'description_preview')
      expect(descColumn).toBeDefined()
      expect(descColumn?.formatter).toBeDefined()
      
      const longDescription = 'C'.repeat(150)
      const mockRow = { description: longDescription }
      const result = descColumn?.formatter?.(null, mockRow)
      expect(result).toBe('C'.repeat(100) + '...')
    })
  })

  describe('Homebrew Configuration', () => {
    let config: DataTypeConfig

    beforeEach(() => {
      config = service.getColumnConfig('homebrew')
    })

    it('should have updated_at column with date formatter', () => {
      const dateColumn = config.essentialColumns.find(col => col.field === 'updated_at')
      expect(dateColumn).toBeDefined()
      expect(dateColumn?.formatter).toBeDefined()
      
      const testDate = new Date('2024-01-15')
      const result = dateColumn?.formatter?.(testDate)
      expect(result).toBe(testDate.toLocaleDateString())
      expect(dateColumn?.formatter?.(null)).toBe('N/A')
    })
  })

  describe('Service Methods', () => {
    it('should get essential columns', () => {
      const columns = service.getEssentialColumns('commonActions')
      expect(Array.isArray(columns)).toBe(true)
      expect(columns.length).toBeGreaterThan(0)
    })

    it('should get searchable fields', () => {
      const fields = service.getSearchableFields('edgeActions')
      expect(Array.isArray(fields)).toBe(true)
      expect(fields).toContain('name')
    })

    it('should get sortable fields', () => {
      const fields = service.getSortableFields('rules')
      expect(Array.isArray(fields)).toBe(true)
      expect(fields).toContain('name')
    })

    it('should get modal sections', () => {
      const sections = service.getModalSections('homebrew')
      expect(Array.isArray(sections)).toBe(true)
      expect(sections.length).toBeGreaterThan(0)
      expect(sections[0]).toHaveProperty('title')
      expect(sections[0]).toHaveProperty('fields')
    })

    it('should filter columns by priority', () => {
      const allColumns = service.getEssentialColumns('commonActions')
      const priority1And2 = service.getColumnsByPriority('commonActions', 2)
      
      expect(priority1And2.length).toBeLessThanOrEqual(allColumns.length)
      priority1And2.forEach(column => {
        expect(column.priority).toBeLessThanOrEqual(2)
      })
    })

    it('should throw error for invalid data type', () => {
      expect(() => {
        // @ts-ignore - Testing invalid data type
        service.getColumnConfig('invalidType')
      }).toThrow('No configuration found for data type: invalidType')
    })
  })

  describe('Column Configuration Validation', () => {
    const dataTypes: DataType[] = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew']

    dataTypes.forEach(dataType => {
      it(`should have valid column configurations for ${dataType}`, () => {
        const config = service.getColumnConfig(dataType)
        
        config.essentialColumns.forEach(column => {
          // Required properties
          expect(column.field).toBeDefined()
          expect(typeof column.field).toBe('string')
          expect(column.header).toBeDefined()
          expect(typeof column.header).toBe('string')
          expect(typeof column.sortable).toBe('boolean')
          expect(typeof column.searchable).toBe('boolean')
          expect([1, 2, 3, 4]).toContain(column.priority)
          
          // Optional properties validation
          if (column.width) {
            expect(typeof column.width).toBe('string')
          }
          if (column.minWidth) {
            expect(typeof column.minWidth).toBe('string')
          }
          if (column.formatter) {
            expect(typeof column.formatter).toBe('function')
          }
          if (column.component) {
            expect(typeof column.component).toBe('string')
          }
        })
      })
    })
  })

  describe('Modal Section Validation', () => {
    const dataTypes: DataType[] = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew']

    dataTypes.forEach(dataType => {
      it(`should have valid modal sections for ${dataType}`, () => {
        const sections = service.getModalSections(dataType)
        
        sections.forEach(section => {
          expect(section.title).toBeDefined()
          expect(typeof section.title).toBe('string')
          expect(Array.isArray(section.fields)).toBe(true)
          
          section.fields.forEach(field => {
            expect(field.key).toBeDefined()
            expect(typeof field.key).toBe('string')
            expect(field.label).toBeDefined()
            expect(typeof field.label).toBe('string')
            expect(['text', 'markdown', 'badge', 'number', 'date', 'boolean']).toContain(field.type)
            
            if (field.formatter) {
              expect(typeof field.formatter).toBe('function')
            }
          })
        })
      })
    })
  })
})