import { describe, it, expect } from 'vitest'
import { columnConfigurationService } from '~/services/columnConfiguration'

describe('Homebrew Page Verification', () => {
  it('should have homebrew configuration in column service', () => {
    const config = columnConfigurationService.getColumnConfig('homebrew')
    
    expect(config).toBeDefined()
    expect(config.essentialColumns).toBeDefined()
    expect(config.essentialColumns.length).toBeGreaterThan(0)
    
    // Verify essential columns for homebrew
    const columnFields = config.essentialColumns.map(col => col.field)
    expect(columnFields).toContain('name')
    expect(columnFields).toContain('category')
    expect(columnFields).toContain('description_preview')
    expect(columnFields).toContain('updated_at')
  })

  it('should have modal sections configured for homebrew', () => {
    const modalSections = columnConfigurationService.getModalSections('homebrew')
    
    expect(modalSections).toBeDefined()
    expect(modalSections.length).toBeGreaterThan(0)
    
    // Verify modal sections exist
    const sectionTitles = modalSections.map(section => section.title)
    expect(sectionTitles).toContain('Basic Information')
    expect(sectionTitles).toContain('Details')
    expect(sectionTitles).toContain('Meta Information')
  })

  it('should have searchable and sortable fields configured', () => {
    const config = columnConfigurationService.getColumnConfig('homebrew')
    
    expect(config.searchableFields).toBeDefined()
    expect(config.searchableFields.length).toBeGreaterThan(0)
    expect(config.searchableFields).toContain('name')
    expect(config.searchableFields).toContain('description')
    
    expect(config.sortableFields).toBeDefined()
    expect(config.sortableFields.length).toBeGreaterThan(0)
    expect(config.sortableFields).toContain('name')
    expect(config.sortableFields).toContain('category')
  })
})