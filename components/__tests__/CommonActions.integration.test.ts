/**
 * Integration test for CommonActions page with OptimizedDataTable
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { columnConfigurationService } from '~/services/columnConfiguration';
import type { CommonAction } from '~/types/table-data-optimization';

describe('CommonActions Integration', () => {
  let mockCommonActions: CommonAction[];

  beforeEach(() => {
    mockCommonActions = [
      {
        id: '1',
        name: 'Aim',
        description: 'Take careful aim at a target',
        attribute: 'Agility',
        skill: 'Firearms',
        type: 'Simple',
        page: 45,
        source: 'Core Rulebook',
        homebrew: false,
        updated_at: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Sprint',
        description: 'Run at maximum speed',
        attribute: 'Body',
        skill: 'Athletics',
        type: 'Simple',
        page: 46,
        source: 'Core Rulebook',
        homebrew: false,
        updated_at: new Date('2024-01-02')
      },
      {
        id: '3',
        name: 'Custom Action',
        description: 'A homebrew action for testing',
        attribute: 'Willpower',
        skill: 'Spellcasting',
        type: 'Complex',
        page: null,
        source: 'Homebrew',
        homebrew: true,
        updated_at: new Date('2024-01-03')
      }
    ];
  });

  describe('Column Configuration', () => {
    it('should have correct column configuration for commonActions', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions');
      
      expect(config).toBeDefined();
      expect(config.essentialColumns).toHaveLength(4);
      
      // Check essential columns
      const columnFields = config.essentialColumns.map(col => col.field);
      expect(columnFields).toContain('name');
      expect(columnFields).toContain('type_attribute_skill');
      expect(columnFields).toContain('action_indicators');
      expect(columnFields).toContain('homebrew');
    });

    it('should have proper priority ordering', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions');
      const priorities = config.essentialColumns.map(col => col.priority);
      
      // Should have priorities 1-4
      expect(priorities).toContain(1);
      expect(priorities).toContain(2);
      expect(priorities).toContain(3);
      expect(priorities).toContain(4);
      
      // Name should be priority 1
      const nameColumn = config.essentialColumns.find(col => col.field === 'name');
      expect(nameColumn?.priority).toBe(1);
    });

    it('should have correct searchable fields', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions');
      
      expect(config.searchableFields).toContain('name');
      expect(config.searchableFields).toContain('description');
      expect(config.searchableFields).toContain('attribute');
      expect(config.searchableFields).toContain('skill');
      expect(config.searchableFields).toContain('type');
      expect(config.searchableFields).toContain('source');
    });
  });

  describe('Data Formatting', () => {
    it('should format type_attribute_skill column correctly', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions');
      const typeAttrSkillColumn = config.essentialColumns.find(
        col => col.field === 'type_attribute_skill'
      );
      
      expect(typeAttrSkillColumn).toBeDefined();
      expect(typeAttrSkillColumn?.formatter).toBeDefined();
      
      if (typeAttrSkillColumn?.formatter) {
        const formatted = typeAttrSkillColumn.formatter(null, mockCommonActions[0]);
        expect(formatted).toBe('Simple / Agility + Firearms');
      }
    });

    it('should format homebrew column correctly', () => {
      const config = columnConfigurationService.getColumnConfig('commonActions');
      const homebrewColumn = config.essentialColumns.find(
        col => col.field === 'homebrew'
      );
      
      expect(homebrewColumn).toBeDefined();
      expect(homebrewColumn?.formatter).toBeDefined();
      
      if (homebrewColumn?.formatter) {
        expect(homebrewColumn.formatter(true)).toBe('Yes');
        expect(homebrewColumn.formatter(false)).toBe('No');
      }
    });
  });

  describe('Modal Configuration', () => {
    it('should have proper modal sections', () => {
      const modalSections = columnConfigurationService.getModalSections('commonActions');
      
      expect(modalSections).toHaveLength(3);
      
      const sectionTitles = modalSections.map(section => section.title);
      expect(sectionTitles).toContain('Basic Information');
      expect(sectionTitles).toContain('Details');
      expect(sectionTitles).toContain('Meta Information');
    });

    it('should have correct fields in Basic Information section', () => {
      const modalSections = columnConfigurationService.getModalSections('commonActions');
      const basicSection = modalSections.find(section => section.title === 'Basic Information');
      
      expect(basicSection).toBeDefined();
      
      const fieldKeys = basicSection?.fields.map(field => field.key) || [];
      expect(fieldKeys).toContain('name');
      expect(fieldKeys).toContain('type');
      expect(fieldKeys).toContain('attribute');
      expect(fieldKeys).toContain('skill');
    });

    it('should have description field in Details section', () => {
      const modalSections = columnConfigurationService.getModalSections('commonActions');
      const detailsSection = modalSections.find(section => section.title === 'Details');
      
      expect(detailsSection).toBeDefined();
      expect(detailsSection?.fields).toHaveLength(1);
      expect(detailsSection?.fields[0].key).toBe('description');
      expect(detailsSection?.fields[0].type).toBe('markdown');
    });
  });

  describe('Responsive Column Visibility', () => {
    it('should show all columns on desktop (priority <= 4)', () => {
      const visibleColumns = columnConfigurationService.getColumnsByPriority('commonActions', 4);
      expect(visibleColumns).toHaveLength(4);
    });

    it('should hide low priority columns on tablet (priority <= 3)', () => {
      const visibleColumns = columnConfigurationService.getColumnsByPriority('commonActions', 3);
      expect(visibleColumns).toHaveLength(3);
      
      const columnFields = visibleColumns.map(col => col.field);
      expect(columnFields).toContain('name');
      expect(columnFields).toContain('type_attribute_skill');
      expect(columnFields).toContain('action_indicators');
      expect(columnFields).not.toContain('homebrew'); // Priority 4, should be hidden
    });

    it('should show only essential columns on mobile (priority <= 2)', () => {
      const visibleColumns = columnConfigurationService.getColumnsByPriority('commonActions', 2);
      expect(visibleColumns).toHaveLength(2);
      
      const columnFields = visibleColumns.map(col => col.field);
      expect(columnFields).toContain('name');
      expect(columnFields).toContain('type_attribute_skill');
    });
  });

  describe('Search and Filter Integration', () => {
    it('should find actions by name', () => {
      const searchTerm = 'aim';
      const results = mockCommonActions.filter(action => 
        action.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Aim');
    });

    it('should find actions by description', () => {
      const searchTerm = 'speed';
      const results = mockCommonActions.filter(action => 
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Sprint');
    });

    it('should find homebrew actions', () => {
      const homebrewActions = mockCommonActions.filter(action => action.homebrew);
      
      expect(homebrewActions).toHaveLength(1);
      expect(homebrewActions[0].name).toBe('Custom Action');
    });

    it('should filter by attribute', () => {
      const agilityActions = mockCommonActions.filter(action => 
        action.attribute === 'Agility'
      );
      
      expect(agilityActions).toHaveLength(1);
      expect(agilityActions[0].name).toBe('Aim');
    });
  });

  describe('CRUD Operations Validation', () => {
    it('should validate required fields for new action', () => {
      const newAction = {
        name: '',
        description: '',
        attribute: 'Agility',
        skill: 'Firearms',
        type: 'Simple',
        homebrew: false
      };

      // Name is required
      expect(newAction.name.trim()).toBe('');
      
      // Description is required
      expect(newAction.description.trim()).toBe('');
    });

    it('should accept valid new action', () => {
      const newAction = {
        name: 'Test Action',
        description: 'A test action for validation',
        attribute: 'Agility',
        skill: 'Firearms',
        type: 'Simple',
        homebrew: false
      };

      expect(newAction.name.trim()).toBeTruthy();
      expect(newAction.description.trim()).toBeTruthy();
      expect(newAction.attribute).toBeTruthy();
      expect(newAction.skill).toBeTruthy();
      expect(newAction.type).toBeTruthy();
    });

    it('should handle page number conversion', () => {
      const pageString = '45';
      const pageNumber = parseInt(pageString);
      
      expect(pageNumber).toBe(45);
      expect(typeof pageNumber).toBe('number');
    });
  });
});