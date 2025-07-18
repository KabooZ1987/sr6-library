import { describe, it, expect, vi } from 'vitest'
import { columnConfigurationService } from '~/services/columnConfiguration'

// Test the EdgeBoosts configuration directly
describe('EdgeBoosts Configuration', () => {
  it('should have correct column configuration for edgeBoosts', () => {
    const config = columnConfigurationService.getColumnConfig('edgeBoosts')
    
    // Check essential columns
    expect(config.essentialColumns).toHaveLength(4)
    
    const columnFields = config.essentialColumns.map(col => col.field)
    expect(columnFields).toContain('name')
    expect(columnFields).toContain('cost')
    expect(columnFields).toContain('effect_summary')
    expect(columnFields).toContain('source')
    
    // Check priorities
    const nameColumn = config.essentialColumns.find(col => col.field === 'name')
    expect(nameColumn?.priority).toBe(1)
    
    const costColumn = config.essentialColumns.find(col => col.field === 'cost')
    expect(costColumn?.priority).toBe(2)
    
    // Check searchable fields
    expect(config.searchableFields).toContain('name')
    expect(config.searchableFields).toContain('description')
    expect(config.searchableFields).toContain('source')
    
    // Check sortable fields
    expect(config.sortableFields).toContain('name')
    expect(config.sortableFields).toContain('cost')
    expect(config.sortableFields).toContain('source')
  })

  it('should have correct modal sections for edgeBoosts', () => {
    const modalSections = columnConfigurationService.getModalSections('edgeBoosts')
    
    expect(modalSections).toHaveLength(3)
    
    const sectionTitles = modalSections.map(section => section.title)
    expect(sectionTitles).toContain('Basic Information')
    expect(sectionTitles).toContain('Details')
    expect(sectionTitles).toContain('Source Information')
    
    // Check Basic Information section
    const basicInfo = modalSections.find(section => section.title === 'Basic Information')
    expect(basicInfo?.fields).toHaveLength(2)
    expect(basicInfo?.fields.map(f => f.key)).toContain('name')
    expect(basicInfo?.fields.map(f => f.key)).toContain('cost')
    
    // Check Details section
    const details = modalSections.find(section => section.title === 'Details')
    expect(details?.fields).toHaveLength(1)
    expect(details?.fields[0].key).toBe('description')
    expect(details?.fields[0].type).toBe('markdown')
    
    // Check Source Information section
    const sourceInfo = modalSections.find(section => section.title === 'Source Information')
    expect(sourceInfo?.fields).toHaveLength(3)
    expect(sourceInfo?.fields.map(f => f.key)).toContain('source')
    expect(sourceInfo?.fields.map(f => f.key)).toContain('page')
    expect(sourceInfo?.fields.map(f => f.key)).toContain('updated_at')
  })

  it('should format cost column correctly', () => {
    const config = columnConfigurationService.getColumnConfig('edgeBoosts')
    const costColumn = config.essentialColumns.find(col => col.field === 'cost')
    
    expect(costColumn?.formatter).toBeDefined()
    
    if (costColumn?.formatter) {
      expect(costColumn.formatter(2, {})).toBe('2')
      expect(costColumn.formatter(null, {})).toBe('N/A')
      expect(costColumn.formatter(undefined, {})).toBe('N/A')
    }
  })

  it('should format effect summary correctly', () => {
    const config = columnConfigurationService.getColumnConfig('edgeBoosts')
    const effectColumn = config.essentialColumns.find(col => col.field === 'effect_summary')
    
    expect(effectColumn?.formatter).toBeDefined()
    
    if (effectColumn?.formatter) {
      const longDescription = 'This is a very long description that should be truncated because it exceeds the maximum length'
      const shortDescription = 'Short description'
      
      const longResult = effectColumn.formatter(null, { description: longDescription })
      const shortResult = effectColumn.formatter(null, { description: shortDescription })
      
      expect(longResult).toContain('...')
      expect(longResult.length).toBeLessThanOrEqual(83) // 80 chars + '...'
      expect(shortResult).toBe(shortDescription)
    }
  })
})