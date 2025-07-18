import { describe, it, expect } from 'vitest'
import { columnConfigurationService } from '~/services/columnConfiguration'

describe('EdgeBoosts Requirements Verification', () => {
  describe('Requirement 4.3: EdgeBoosts column configuration', () => {
    it('should display name, effect summary, cost, and applicability as key columns', () => {
      const config = columnConfigurationService.getColumnConfig('edgeBoosts')
      const columnFields = config.essentialColumns.map(col => col.field)
      
      // Verify required columns from task description
      expect(columnFields).toContain('name')
      expect(columnFields).toContain('cost')
      expect(columnFields).toContain('effect_summary') // effect summary
      expect(columnFields).toContain('source') // applicability/source
      
      // Verify column priorities for responsive display
      const nameColumn = config.essentialColumns.find(col => col.field === 'name')
      const costColumn = config.essentialColumns.find(col => col.field === 'cost')
      const effectColumn = config.essentialColumns.find(col => col.field === 'effect_summary')
      const sourceColumn = config.essentialColumns.find(col => col.field === 'source')
      
      expect(nameColumn?.priority).toBe(1) // Highest priority
      expect(costColumn?.priority).toBe(2)
      expect(effectColumn?.priority).toBe(3)
      expect(sourceColumn?.priority).toBe(4)
    })

    it('should have proper column headers and formatting', () => {
      const config = columnConfigurationService.getColumnConfig('edgeBoosts')
      
      const nameColumn = config.essentialColumns.find(col => col.field === 'name')
      const costColumn = config.essentialColumns.find(col => col.field === 'cost')
      const effectColumn = config.essentialColumns.find(col => col.field === 'effect_summary')
      const sourceColumn = config.essentialColumns.find(col => col.field === 'source')
      
      expect(nameColumn?.header).toBe('Name')
      expect(costColumn?.header).toBe('Cost')
      expect(effectColumn?.header).toBe('Effect')
      expect(sourceColumn?.header).toBe('Source')
      
      // Verify cost formatting
      expect(costColumn?.formatter).toBeDefined()
      if (costColumn?.formatter) {
        expect(costColumn.formatter(2, {})).toBe('2')
        expect(costColumn.formatter(null, {})).toBe('N/A')
      }
      
      // Verify effect summary formatting (truncation)
      expect(effectColumn?.formatter).toBeDefined()
      if (effectColumn?.formatter) {
        const longText = 'This is a very long description that should be truncated to fit in the table column properly'
        const result = effectColumn.formatter(null, { description: longText })
        expect(result).toContain('...')
        expect(result.length).toBeLessThanOrEqual(83) // 80 chars + '...'
      }
    })
  })

  describe('Requirement 3.4: Modal integration and data display', () => {
    it('should have proper modal sections for detailed view', () => {
      const modalSections = columnConfigurationService.getModalSections('edgeBoosts')
      
      expect(modalSections).toHaveLength(3)
      
      // Basic Information section
      const basicInfo = modalSections.find(section => section.title === 'Basic Information')
      expect(basicInfo).toBeDefined()
      expect(basicInfo?.fields.map(f => f.key)).toContain('name')
      expect(basicInfo?.fields.map(f => f.key)).toContain('cost')
      
      // Details section with markdown support
      const details = modalSections.find(section => section.title === 'Details')
      expect(details).toBeDefined()
      expect(details?.fields).toHaveLength(1)
      expect(details?.fields[0].key).toBe('description')
      expect(details?.fields[0].type).toBe('markdown')
      
      // Source Information section
      const sourceInfo = modalSections.find(section => section.title === 'Source Information')
      expect(sourceInfo).toBeDefined()
      expect(sourceInfo?.fields.map(f => f.key)).toContain('source')
      expect(sourceInfo?.fields.map(f => f.key)).toContain('page')
      expect(sourceInfo?.fields.map(f => f.key)).toContain('updated_at')
    })
  })

  describe('Search and Filter functionality', () => {
    it('should include all relevant fields in searchable fields', () => {
      const config = columnConfigurationService.getColumnConfig('edgeBoosts')
      
      // Verify searchable fields include both visible and hidden fields
      expect(config.searchableFields).toContain('name')
      expect(config.searchableFields).toContain('description') // Hidden field but searchable
      expect(config.searchableFields).toContain('source')
    })

    it('should include sortable fields for key columns', () => {
      const config = columnConfigurationService.getColumnConfig('edgeBoosts')
      
      expect(config.sortableFields).toContain('name')
      expect(config.sortableFields).toContain('cost')
      expect(config.sortableFields).toContain('source')
      expect(config.sortableFields).toContain('updated_at')
    })
  })

  describe('Responsive design considerations', () => {
    it('should have appropriate column widths and priorities', () => {
      const config = columnConfigurationService.getColumnConfig('edgeBoosts')
      
      const nameColumn = config.essentialColumns.find(col => col.field === 'name')
      const costColumn = config.essentialColumns.find(col => col.field === 'cost')
      const effectColumn = config.essentialColumns.find(col => col.field === 'effect_summary')
      const sourceColumn = config.essentialColumns.find(col => col.field === 'source')
      
      // Verify responsive widths
      expect(nameColumn?.minWidth).toBe('150px')
      expect(costColumn?.width).toBe('80px')
      expect(effectColumn?.minWidth).toBe('200px')
      expect(sourceColumn?.width).toBe('120px')
      
      // Verify priority levels for mobile responsiveness
      expect(nameColumn?.priority).toBe(1) // Always visible
      expect(costColumn?.priority).toBe(2) // Visible on tablet+
      expect(effectColumn?.priority).toBe(3) // Visible on desktop
      expect(sourceColumn?.priority).toBe(4) // Desktop only
    })
  })
})