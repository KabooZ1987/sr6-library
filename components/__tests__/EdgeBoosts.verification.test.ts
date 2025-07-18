import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('EdgeBoosts Implementation Verification', () => {
  it('should have EdgeBoosts page using OptimizedDataTable', () => {
    const edgeBoostsPagePath = join(process.cwd(), 'pages/edgeBoosts.vue')
    const pageContent = readFileSync(edgeBoostsPagePath, 'utf-8')
    
    // Verify OptimizedDataTable is used
    expect(pageContent).toContain('<OptimizedDataTable')
    expect(pageContent).toContain('data-type="edgeBoosts"')
    expect(pageContent).toContain(':searchable="true"')
    expect(pageContent).toContain(':filterable="true"')
    
    // Verify event handlers are present
    expect(pageContent).toContain('@view="viewItem"')
    expect(pageContent).toContain('@edit="editItem"')
    expect(pageContent).toContain('@delete="confirmDelete"')
    
    // Verify DetailModal integration
    expect(pageContent).toContain('<DetailModal')
    expect(pageContent).toContain(':data-type="\'edgeBoosts\'"')
    expect(pageContent).toContain(':modal-sections="modalSections"')
  })

  it('should have proper column configuration service import', () => {
    const edgeBoostsPagePath = join(process.cwd(), 'pages/edgeBoosts.vue')
    const pageContent = readFileSync(edgeBoostsPagePath, 'utf-8')
    
    // Verify column configuration service is imported and used
    expect(pageContent).toContain('columnConfigurationService')
    expect(pageContent).toContain('getModalSections(\'edgeBoosts\')')
  })

  it('should have OptimizedDataTable component with proper structure', () => {
    const optimizedTablePath = join(process.cwd(), 'components/OptimizedDataTable.vue')
    const componentContent = readFileSync(optimizedTablePath, 'utf-8')
    
    // Verify component accepts edgeBoosts data type
    expect(componentContent).toContain('DataType')
    expect(componentContent).toContain('dataType: DataType')
    
    // Verify responsive column handling
    expect(componentContent).toContain('visibleColumns')
    expect(componentContent).toContain('getMaxPriorityForScreen')
    
    // Verify search and filter functionality
    expect(componentContent).toContain('filteredData')
    expect(componentContent).toContain('globalFilter')
    expect(componentContent).toContain('searchableFields')
  })

  it('should have DetailModal component with proper modal sections support', () => {
    const detailModalPath = join(process.cwd(), 'components/DetailModal.vue')
    const componentContent = readFileSync(detailModalPath, 'utf-8')
    
    // Verify modal sections support
    expect(componentContent).toContain('modalSections')
    expect(componentContent).toContain('ModalSection')
    
    // Verify markdown rendering for descriptions
    expect(componentContent).toContain('renderMarkdown')
    expect(componentContent).toContain('marked.parse')
    
    // Verify field type handling
    expect(componentContent).toContain('field.type === \'markdown\'')
    expect(componentContent).toContain('field.type === \'boolean\'')
  })

  it('should have column configuration for edgeBoosts with required fields', () => {
    const configPath = join(process.cwd(), 'services/columnConfiguration.ts')
    const configContent = readFileSync(configPath, 'utf-8')
    
    // Verify edgeBoosts configuration exists
    expect(configContent).toContain('createEdgeBoostsConfig')
    expect(configContent).toContain('edgeBoosts')
    
    // Verify essential columns are defined
    expect(configContent).toContain('name')
    expect(configContent).toContain('cost')
    expect(configContent).toContain('effect_summary')
    expect(configContent).toContain('source')
    
    // Verify modal sections are defined
    expect(configContent).toContain('Basic Information')
    expect(configContent).toContain('Details')
    expect(configContent).toContain('Source Information')
  })
})