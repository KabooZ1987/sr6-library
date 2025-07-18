import { describe, it, expect } from 'vitest'
import { columnConfigurationService } from '~/services/columnConfiguration'

describe('Search and Filter Integration', () => {
  const mockData = [
    {
      id: '1',
      name: 'Test Action 1',
      type: 'Major',
      attribute: 'Agility',
      skill: 'Firearms',
      description: 'Test description 1',
      homebrew: false,
      updated_at: '2024-01-01'
    },
    {
      id: '2',
      name: 'Test Action 2',
      type: 'Minor',
      attribute: 'Logic',
      skill: 'Computer',
      description: 'Test description 2',
      homebrew: true,
      updated_at: '2024-01-02'
    },
    {
      id: '3',
      name: 'Another Action',
      type: 'Major',
      attribute: 'Body',
      skill: 'Athletics',
      description: 'Another description',
      homebrew: false,
      updated_at: '2024-01-03'
    }
  ]

  // Helper function to simulate the filteredData computed property logic
  function filterData(
    data: any[], 
    globalFilter: string, 
    advancedFilters: Record<string, string>, 
    searchableFields: string[]
  ) {
    let result = [...data]
    
    // Apply global search filter across all searchable fields
    if (globalFilter && globalFilter.trim()) {
      const searchTerm = globalFilter.toLowerCase().trim()
      result = result.filter(item => {
        return searchableFields.some(field => {
          const value = getNestedValue(item, field)
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchTerm)
        })
      })
    }
    
    // Apply advanced filters (field-specific filters)
    Object.keys(advancedFilters).forEach(field => {
      const filterValue = advancedFilters[field]
      if (filterValue && filterValue.trim()) {
        const searchTerm = filterValue.toLowerCase().trim()
        result = result.filter(item => {
          const value = getNestedValue(item, field)
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchTerm)
        })
      }
    })
    
    return result
  }

  function getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  describe('Global Search Functionality', () => {
    it('should search across all searchable fields for commonActions', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      // Search by name (visible field)
      let filtered = filterData(mockData, 'Test Action 1', {}, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Test Action 1')
      
      // Search by description (hidden field)
      filtered = filterData(mockData, 'Test description 2', {}, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].description).toBe('Test description 2')
      
      // Search by attribute (hidden field)
      filtered = filterData(mockData, 'Logic', {}, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].attribute).toBe('Logic')
      
      // Search by skill (hidden field)
      filtered = filterData(mockData, 'Athletics', {}, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].skill).toBe('Athletics')
    })

    it('should return multiple results for partial matches', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      // Search for "Test" should return 2 results
      const filtered = filterData(mockData, 'Test', {}, searchableFields)
      expect(filtered).toHaveLength(2)
      expect(filtered.map(item => item.name)).toEqual(['Test Action 1', 'Test Action 2'])
    })

    it('should return empty array for no matches', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      const filtered = filterData(mockData, 'NonExistentTerm', {}, searchableFields)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('Advanced Filter Functionality', () => {
    it('should filter by specific fields', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      // Filter by name field only
      let filtered = filterData(mockData, '', { name: 'Test Action 1' }, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Test Action 1')
      
      // Filter by type field
      filtered = filterData(mockData, '', { type: 'Major' }, searchableFields)
      expect(filtered).toHaveLength(2)
      expect(filtered.every(item => item.type === 'Major')).toBe(true)
      
      // Filter by homebrew status
      filtered = filterData(mockData, '', { homebrew: 'true' }, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].homebrew).toBe(true)
    })

    it('should combine multiple advanced filters', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      // Filter by type AND attribute
      const filtered = filterData(mockData, '', { type: 'Major', attribute: 'Agility' }, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].type).toBe('Major')
      expect(filtered[0].attribute).toBe('Agility')
    })
  })

  describe('Combined Search and Filter', () => {
    it('should combine global search with advanced filters', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      // Global search for "Test" AND filter by type "Major"
      const filtered = filterData(mockData, 'Test', { type: 'Major' }, searchableFields)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Test Action 1')
      expect(filtered[0].type).toBe('Major')
    })

    it('should return empty when combined filters have no matches', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions')
      const searchableFields = config.searchableFields
      
      // Global search for "Test" AND filter by type "NonExistent"
      const filtered = filterData(mockData, 'Test', { type: 'NonExistent' }, searchableFields)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('Cross Data Type Support', () => {
    const dataTypes = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew'] as const
    
    dataTypes.forEach(dataType => {
      it(`should have searchable fields configured for ${dataType}`, () => {
        const config = columnConfigurationService.getColumnConfig(dataType)
        expect(config.searchableFields).toBeDefined()
        expect(config.searchableFields.length).toBeGreaterThan(0)
        expect(config.searchableFields).toContain('name')
      })

      it(`should have sortable fields configured for ${dataType}`, () => {
        const config = columnConfigurationService.getColumnConfig(dataType)
        expect(config.sortableFields).toBeDefined()
        expect(config.sortableFields.length).toBeGreaterThan(0)
        expect(config.sortableFields).toContain('name')
      })
    })
  })

  describe('Sorting Configuration', () => {
    it('should have proper sorting configuration for all data types', () => {
      const dataTypes = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew'] as const
      
      dataTypes.forEach(dataType => {
        const config = columnConfigurationService.getColumnConfig(dataType)
        const essentialColumns = config.essentialColumns
        const sortableFields = config.sortableFields
        
        // At least one essential column should be sortable
        const hasSortableEssentialColumn = essentialColumns.some(col => col.sortable)
        expect(hasSortableEssentialColumn).toBe(true)
        
        // All sortable essential columns should be in sortableFields array
        const sortableEssentialFields = essentialColumns
          .filter(col => col.sortable)
          .map(col => col.field)
        
        sortableEssentialFields.forEach(field => {
          expect(sortableFields).toContain(field)
        })
      })
    })

    it('should have name field as sortable for all data types', () => {
      const dataTypes = ['commonActions', 'edgeActions', 'edgeBoosts', 'rules', 'homebrew'] as const
      
      dataTypes.forEach(dataType => {
        const config = columnConfigurationService.getColumnConfig(dataType)
        const nameColumn = config.essentialColumns.find(col => col.field === 'name')
        
        expect(nameColumn).toBeDefined()
        expect(nameColumn?.sortable).toBe(true)
        expect(config.sortableFields).toContain('name')
      })
    })
  })
})