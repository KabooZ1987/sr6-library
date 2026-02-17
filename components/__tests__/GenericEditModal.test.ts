import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import GenericEditModal from '../GenericEditModal.vue'
import { columnConfigurationService } from '~/services/columnConfiguration'

// Mock PrimeVue components
vi.mock('primevue/dialog', () => ({
  default: {
    name: 'Dialog',
    template: '<div v-if="visible" data-testid="dialog"><slot /><slot name="footer" /></div>',
    props: ['visible']
  }
}))

vi.mock('primevue/button', () => ({
  default: {
    name: 'Button',
    template: '<button @click="$emit(\'click\')">{{ label }}</button>',
    props: ['label']
  }
}))

// Mock custom components
vi.mock('../InputField.vue', () => ({
  default: {
    name: 'InputField',
    template: '<input data-testid="input-field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'label', 'type']
  }
}))

vi.mock('../SelectField.vue', () => ({
  default: {
    name: 'SelectField',
    template: '<select data-testid="select-field" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.Name }}</option></select>',
    props: ['modelValue', 'label', 'options']
  }
}))

vi.mock('../Table/MarkdownInput.vue', () => ({
  default: {
    name: 'MarkdownInput',
    template: '<textarea data-testid="markdown-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue']
  }
}))

describe('GenericEditModal', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    cost: 5,
    description: 'Test Description'
  }

  const stubs = {
    Dialog: {
      template: '<div v-if="visible" data-testid="dialog"><slot /><slot name="footer" /></div>',
      props: ['visible']
    },
    Button: {
      template: '<button @click="$emit(\'click\')">{{ label }}</button>',
      props: ['label']
    },
    InputField: {
      template: '<input data-testid="input-field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ['modelValue', 'label', 'type']
    },
    SelectField: {
      template: '<select data-testid="select-field" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.Name }}</option></select>',
      props: ['modelValue', 'label', 'options']
    },
    MarkdownInput: {
      template: '<textarea data-testid="markdown-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
      props: ['modelValue']
    },
    Checkbox: {
      template: '<input type="checkbox" data-testid="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
      props: ['modelValue', 'binary']
    }
  }

  it('should render fields based on column configuration', async () => {
    const wrapper = mount(GenericEditModal, {
      props: {
        visible: true,
        item: mockItem,
        dataType: 'edgeActions',
        isEdit: true,
        title: 'Edge Action'
      },
      global: { stubs }
    })

    await nextTick()

    // Check if Name input is rendered
    const nameInput = wrapper.find('[data-testid="input-field"]')
    expect(nameInput.exists()).toBe(true)
    
    // Check if description (markdown/textarea) is rendered
    // In edgeActions config, description is textarea or markdown
    const sections = columnConfigurationService.getModalSections('edgeActions')
    const hasMarkdown = sections.some(s => s.fields.some(f => f.type === 'markdown'))
    const hasTextarea = sections.some(s => s.fields.some(f => f.type === 'textarea'))
    
    if (hasMarkdown) {
      expect(wrapper.find('[data-testid="markdown-input"]').exists()).toBe(true)
    } else if (hasTextarea) {
      expect(wrapper.find('textarea').exists()).toBe(true)
    }
  })

  it('should render checkbox for boolean fields', async () => {
    const wrapper = mount(GenericEditModal, {
      props: {
        visible: true,
        item: mockItem,
        dataType: 'rules',
        isEdit: true,
        title: 'Rule'
      },
      global: { stubs }
    })

    await nextTick()

    // rules config has homebrew as boolean
    expect(wrapper.find('[data-testid="checkbox"]').exists()).toBe(true)
  })

  it('should emit save event with updated data', async () => {
    const wrapper = mount(GenericEditModal, {
      props: {
        visible: true,
        item: mockItem,
        dataType: 'edgeActions',
        isEdit: true,
        title: 'Edge Action'
      },
      global: { stubs }
    })

    await nextTick()

    const nameInput = wrapper.find('[data-testid="input-field"]')
    await nameInput.setValue('Updated Name')

    const saveButton = wrapper.findAll('button').find(b => b.text() === 'Save')
    await saveButton.trigger('click')

    expect(wrapper.emitted().save).toBeTruthy()
    expect(wrapper.emitted().save[0][0].name).toBe('Updated Name')
    expect(wrapper.emitted().save[0][0].id).toBe('1')
  })

  it('should emit close event when cancel is clicked', async () => {
    const wrapper = mount(GenericEditModal, {
      props: {
        visible: true,
        item: mockItem,
        dataType: 'edgeActions',
        isEdit: true,
        title: 'Edge Action'
      },
      global: { stubs }
    })

    await nextTick()

    const cancelButton = wrapper.findAll('button').find(b => b.text() === 'Cancel')
    await cancelButton.trigger('click')

    expect(wrapper.emitted().close).toBeTruthy()
  })
})
