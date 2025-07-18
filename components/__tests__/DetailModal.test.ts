import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import DetailModal from '../DetailModal.vue';
import type { TableDataType } from '~/types/table-data-optimization';
import type { ModalSection } from '~/services/columnConfiguration';

// Mock marked
vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((text: string) => `<p>${text}</p>`)
  }
}));

describe('DetailModal', () => {
  let wrapper: VueWrapper<any>;

  const mockCommonAction: TableDataType = {
    id: '1',
    name: 'Test Action',
    description: 'This is a test action description',
    attribute: 'Body',
    skill: 'Athletics',
    type: 'Simple',
    homebrew: false,
    source: 'Core Rulebook',
    page: 123,
    updated_at: new Date('2024-01-01')
  };

  const mockModalSections: ModalSection[] = [
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
  ];

  const globalComponents = {
    Dialog: {
      name: 'Dialog',
      template: '<div class="p-dialog" v-if="visible"><slot name="header"></slot><slot></slot></div>',
      props: ['visible', 'modal', 'header', 'style', 'breakpoints'],
      emits: ['hide']
    },
    Button: {
      name: 'Button',
      template: '<button class="p-button" @click="$emit(\'click\')"><i :class="icon"></i></button>',
      props: ['icon', 'severity', 'size'],
      emits: ['click']
    },
    Badge: {
      name: 'Badge',
      template: '<span class="p-badge" :class="severity">{{ value }}</span>',
      props: ['value', 'severity']
    },
    Tag: {
      name: 'Tag',
      template: '<span class="p-tag" :class="severity">{{ value }}</span>',
      props: ['value', 'severity']
    },
    ProgressSpinner: {
      name: 'ProgressSpinner',
      template: '<div class="p-progress-spinner">Loading...</div>'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render when visible is true', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.find('.p-dialog').exists()).toBe(true);
      expect(wrapper.find('.detail-modal-content').exists()).toBe(true);
    });

    it('should not render when visible is false', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: false,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.find('.p-dialog').exists()).toBe(false);
    });

    it('should display modal title from item name', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.text()).toContain('Test Action');
    });

    it('should display default title when item has no name', () => {
      const itemWithoutName = { ...mockCommonAction, name: '' };
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: itemWithoutName,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.text()).toContain('Entry Details');
    });
  });

  describe('Loading State', () => {
    it('should show progress spinner when loading', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          loading: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.find('.p-progress-spinner').exists()).toBe(true);
      expect(wrapper.find('.detail-section').exists()).toBe(false);
    });

    it('should hide progress spinner when not loading', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          loading: false,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.find('.p-progress-spinner').exists()).toBe(false);
      expect(wrapper.find('.detail-section').exists()).toBe(true);
    });
  });

  describe('Section Organization', () => {
    beforeEach(() => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });
    });

    it('should render all modal sections', () => {
      const sections = wrapper.findAll('.detail-section');
      expect(sections).toHaveLength(3);
    });

    it('should display section titles correctly', () => {
      const sectionTitles = wrapper.findAll('.section-title');
      expect(sectionTitles[0].text()).toBe('Basic Information');
      expect(sectionTitles[1].text()).toBe('Details');
      expect(sectionTitles[2].text()).toBe('Meta Information');
    });

    it('should render fields within sections', () => {
      const basicInfoSection = wrapper.findAll('.detail-section')[0];
      const fields = basicInfoSection.findAll('.field-group');
      expect(fields.length).toBeGreaterThan(0);
    });

    it('should display field labels correctly', () => {
      const labels = wrapper.findAll('.field-label');
      const labelTexts = labels.map(label => label.text());
      expect(labelTexts).toContain('Name');
      expect(labelTexts).toContain('Action Type');
      expect(labelTexts).toContain('Attribute');
      expect(labelTexts).toContain('Skill');
    });
  });

  describe('Field Rendering', () => {
    beforeEach(() => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });
    });

    it('should render text fields correctly', () => {
      expect(wrapper.text()).toContain('Test Action');
      expect(wrapper.text()).toContain('Simple');
      expect(wrapper.text()).toContain('Body');
      expect(wrapper.text()).toContain('Athletics');
    });

    it('should render markdown fields with HTML', () => {
      const markdownContent = wrapper.find('.markdown-content');
      expect(markdownContent.exists()).toBe(true);
      expect(markdownContent.html()).toContain('<p>This is a test action description</p>');
    });

    it('should render boolean fields as tags', () => {
      const booleanTags = wrapper.findAll('.p-tag');
      expect(booleanTags.length).toBeGreaterThan(0);
      // Should show "No" for homebrew: false
      expect(wrapper.text()).toContain('No');
    });

    it('should render date fields formatted', () => {
      expect(wrapper.text()).toContain('01/01/2024');
    });

    it('should render number fields as strings', () => {
      expect(wrapper.text()).toContain('123');
    });

    it('should show N/A for missing values', () => {
      const itemWithMissingFields = { ...mockCommonAction, source: null };
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: itemWithMissingFields,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.text()).toContain('N/A');
    });
  });

  describe('Navigation Controls', () => {
    it('should show navigation buttons when showNavigation is true', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections,
          showNavigation: true,
          hasPrevious: true,
          hasNext: true
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const navButtons = wrapper.findAll('.p-button');
      const prevButton = navButtons.find(btn => btn.html().includes('pi-chevron-left'));
      const nextButton = navButtons.find(btn => btn.html().includes('pi-chevron-right'));
      
      expect(prevButton).toBeDefined();
      expect(nextButton).toBeDefined();
    });

    it('should hide previous button when hasPrevious is false', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections,
          showNavigation: true,
          hasPrevious: false,
          hasNext: true
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const navButtons = wrapper.findAll('.p-button');
      const prevButton = navButtons.find(btn => btn.html().includes('pi-chevron-left'));
      
      expect(prevButton).toBeUndefined();
    });

    it('should hide next button when hasNext is false', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections,
          showNavigation: true,
          hasPrevious: true,
          hasNext: false
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const navButtons = wrapper.findAll('.p-button');
      const nextButton = navButtons.find(btn => btn.html().includes('pi-chevron-right'));
      
      expect(nextButton).toBeUndefined();
    });

    it('should emit navigate event when navigation buttons are clicked', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections,
          showNavigation: true,
          hasPrevious: true,
          hasNext: true
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const navButtons = wrapper.findAll('.p-button');
      const prevButton = navButtons.find(btn => btn.html().includes('pi-chevron-left'));
      const nextButton = navButtons.find(btn => btn.html().includes('pi-chevron-right'));

      await prevButton?.trigger('click');
      expect(wrapper.emitted('navigate')).toEqual([['previous']]);

      await nextButton?.trigger('click');
      expect(wrapper.emitted('navigate')).toEqual([['previous'], ['next']]);
    });
  });

  describe('Edit Button', () => {
    it('should show edit button by default', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const editButton = wrapper.findAll('.p-button').find(btn => 
        btn.html().includes('pi-pencil')
      );
      expect(editButton).toBeDefined();
    });

    it('should hide edit button when showEditButton is false', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections,
          showEditButton: false
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const editButton = wrapper.findAll('.p-button').find(btn => 
        btn.html().includes('pi-pencil')
      );
      expect(editButton).toBeUndefined();
    });

    it('should emit edit event when edit button is clicked', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const editButton = wrapper.findAll('.p-button').find(btn => 
        btn.html().includes('pi-pencil')
      );
      
      await editButton?.trigger('click');
      expect(wrapper.emitted('edit')).toEqual([[mockCommonAction]]);
    });
  });

  describe('Fallback Content', () => {
    it('should render fallback content when no modal sections provided', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: []
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.find('.fallback-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('All Fields');
    });

    it('should format field names in fallback mode', () => {
      const itemWithUnderscores = {
        id: '1',
        name: 'Test',
        field_with_underscores: 'value',
        camelCaseField: 'value'
      };

      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: itemWithUnderscores,
          modalSections: []
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.text()).toContain('Field with underscores');
      expect(wrapper.text()).toContain('Camel Case Field');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no item provided', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: null,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      expect(wrapper.find('.empty-state').exists()).toBe(true);
      expect(wrapper.text()).toContain('No data available to display');
    });
  });

  describe('Event Handling', () => {
    it('should emit close event when dialog hide is triggered', async () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      // Simulate dialog hide event
      const dialog = wrapper.findComponent({ name: 'Dialog' });
      await dialog.vm.$emit('hide');

      expect(wrapper.emitted('close')).toHaveLength(1);
    });
  });

  describe('Badge Severity', () => {
    it('should apply correct severity for homebrew badge', () => {
      const homebrewItem = { ...mockCommonAction, homebrew: true };
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: homebrewItem,
          modalSections: [
            {
              title: 'Test',
              fields: [
                { key: 'homebrew', label: 'Homebrew', type: 'badge' }
              ]
            }
          ]
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const badge = wrapper.find('.p-badge');
      expect(badge.classes()).toContain('info');
    });

    it('should apply correct severity for cost badge', () => {
      const costItem = { ...mockCommonAction, cost: 3 };
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: costItem,
          modalSections: [
            {
              title: 'Test',
              fields: [
                { key: 'cost', label: 'Cost', type: 'badge' }
              ]
            }
          ]
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const badge = wrapper.find('.p-badge');
      expect(badge.classes()).toContain('warning');
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply full-width class to markdown fields', () => {
      wrapper = mount(DetailModal, {
        props: {
          visible: true,
          item: mockCommonAction,
          modalSections: mockModalSections
        },
        global: {
          components: globalComponents,
          directives: {
            tooltip: {}
          }
        }
      });

      const markdownField = wrapper.findAll('.field-group').find(field => 
        field.classes().includes('field-full-width')
      );
      expect(markdownField).toBeDefined();
    });
  });
});