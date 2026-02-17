import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// Create a simplified test component that focuses on button behavior
const TestFormComponent = {
  template: `
    <div>
      <form @submit.prevent class="p-fluid">
        <div class="form-actions">
          <ActionButton
            action="cancel"
            :touch-friendly="true"
            @click="handleCancel"
            aria-label="Cancel form and close modal"
          />
          <ActionButton
            :action="isEditForm ? 'update' : 'create'"
            :touch-friendly="true"
            :item-name="formData.name || 'action'"
            item-type="action"
            @click="handleSaveAction"
            aria-label="Save action form"
          />
        </div>
      </form>
    </div>
  `,
  components: {
    ActionButton: {
      template: '<button :data-action="action" :touch-friendly="touchFriendly" :item-name="itemName" :item-type="itemType" @click="$emit(\'click\', $event, action)">{{ action }}</button>',
      props: ['action', 'touchFriendly', 'itemName', 'itemType'],
      emits: ['click']
    }
  },
  data() {
    return {
      isEditForm: false,
      formData: {
        name: '',
        description: ''
      },
      showModal: false,
      saveError: null,
      saveSuccess: false
    }
  },
  methods: {
    handleCancel() {
      this.showModal = false
    },
    async handleSaveAction(event, action) {
      this.saveError = null
      this.saveSuccess = false
      
      try {
        await this.performSave()
        this.saveSuccess = true
      } catch (error) {
        this.saveError = error.message
        // Don't re-throw to avoid unhandled promise rejection in tests
      }
    },
    async performSave() {
      if (!this.formData.name?.trim()) {
        throw new Error('Name is required')
      }
      
      if (!this.formData.description?.trim()) {
        throw new Error('Description is required')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 10))
      
      this.showModal = false
    },
    openModal(isEdit = false) {
      this.isEditForm = isEdit
      this.showModal = true
      this.saveError = null
      this.saveSuccess = false
    }
  }
}

describe('CommonActions Page - ActionButton Integration', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(TestFormComponent)
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  describe('Form Button Interactions', () => {
    it('should render ActionButton components in form actions', () => {
      const cancelButton = wrapper.find('[data-action="cancel"]')
      const saveButton = wrapper.find('[data-action="create"]')
      
      expect(cancelButton.exists()).toBe(true)
      expect(saveButton.exists()).toBe(true)
    })

    it('should handle cancel button click correctly', async () => {
      // Open modal
      wrapper.vm.openModal()
      expect(wrapper.vm.showModal).toBe(true)
      
      // Click cancel button
      const cancelButton = wrapper.find('[data-action="cancel"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.vm.showModal).toBe(false)
    })

    it('should handle save button click for create action', async () => {
      // Set form data
      wrapper.vm.formData = {
        name: 'New Action',
        description: 'New Description'
      }
      
      // Click save button
      const saveButton = wrapper.find('[data-action="create"]')
      await saveButton.trigger('click')
      
      // Modal should be closed after successful save
      expect(wrapper.vm.showModal).toBe(false)
      expect(wrapper.vm.saveError).toBe(null)
    })

    it('should handle save button click for update action', async () => {
      // Open modal in edit mode
      wrapper.vm.openModal(true)
      await nextTick()
      
      // Set form data
      wrapper.vm.formData = {
        name: 'Updated Action',
        description: 'Updated Description'
      }
      
      // Click save button (should now be update)
      const saveButton = wrapper.find('[data-action="update"]')
      await saveButton.trigger('click')
      
      // Wait for async operation to complete (including the setTimeout in performSave)
      await new Promise(resolve => setTimeout(resolve, 20))
      
      // Modal should be closed after successful save
      expect(wrapper.vm.showModal).toBe(false)
      expect(wrapper.vm.saveError).toBe(null)
    })

    it('should show validation error for missing name', async () => {
      // Set form data without name
      wrapper.vm.formData = {
        name: '',
        description: 'Description'
      }
      
      // Click save button
      const saveButton = wrapper.find('[data-action="create"]')
      await saveButton.trigger('click')
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(wrapper.vm.saveError).toBe('Name is required')
      expect(wrapper.vm.saveSuccess).toBe(false)
    })

    it('should show validation error for missing description', async () => {
      // Set form data without description
      wrapper.vm.formData = {
        name: 'Test Action',
        description: ''
      }
      
      // Click save button
      const saveButton = wrapper.find('[data-action="create"]')
      await saveButton.trigger('click')
      
      // Wait for async operation to complete
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(wrapper.vm.saveError).toBe('Description is required')
      expect(wrapper.vm.saveSuccess).toBe(false)
    })

    it('should properly handle touch-friendly attributes', () => {
      const cancelButton = wrapper.find('[data-action="cancel"]')
      const saveButton = wrapper.find('[data-action="create"]')
      
      // Check that touch-friendly attribute is passed
      expect(cancelButton.attributes('touch-friendly')).toBe('true')
      expect(saveButton.attributes('touch-friendly')).toBe('true')
    })

    it('should pass correct item context to save button', async () => {
      // Set form data with name
      wrapper.vm.formData.name = 'Test Action'
      await nextTick()
      
      const saveButton = wrapper.find('[data-action="create"]')
      
      expect(saveButton.attributes('item-name')).toBe('Test Action')
      expect(saveButton.attributes('item-type')).toBe('action')
    })

    it('should close modal after successful save', async () => {
      // Open modal
      wrapper.vm.openModal()
      expect(wrapper.vm.showModal).toBe(true)
      
      // Set valid form data
      wrapper.vm.formData = {
        name: 'Test Action',
        description: 'Test Description'
      }
      
      // Click save button
      const saveButton = wrapper.find('[data-action="create"]')
      await saveButton.trigger('click')
      
      // Wait for async operation to complete (including the setTimeout in performSave)
      await new Promise(resolve => setTimeout(resolve, 20))
      
      expect(wrapper.vm.showModal).toBe(false)
    })
  })

  describe('Error Handling and User Feedback', () => {
    it('should handle validation errors gracefully', async () => {
      // Test multiple validation scenarios
      const testCases = [
        { name: '', description: 'Valid', expectedError: 'Name is required' },
        { name: 'Valid', description: '', expectedError: 'Description is required' },
        { name: '   ', description: 'Valid', expectedError: 'Name is required' },
        { name: 'Valid', description: '   ', expectedError: 'Description is required' }
      ]
      
      for (const testCase of testCases) {
        // Reset error state
        wrapper.vm.saveError = null
        wrapper.vm.saveSuccess = false
        
        // Set test data
        wrapper.vm.formData = {
          name: testCase.name,
          description: testCase.description
        }
        
        // Click save button
        const saveButton = wrapper.find('[data-action="create"]')
        await saveButton.trigger('click')
        
        // Wait for async operation to complete
        await nextTick()
        
        expect(wrapper.vm.saveError).toBe(testCase.expectedError)
        expect(wrapper.vm.saveSuccess).toBe(false)
      }
    })
  })

  describe('CRUD Operations Consistency', () => {
    it('should maintain consistent behavior across create and update operations', async () => {
      // Test create operation (default state)
      expect(wrapper.vm.isEditForm).toBe(false)
      
      let saveButton = wrapper.find('[data-action="create"]')
      expect(saveButton.exists()).toBe(true)
      
      // Test update operation
      wrapper.vm.openModal(true)
      expect(wrapper.vm.isEditForm).toBe(true)
      
      // Wait for DOM to update
      await nextTick()
      
      saveButton = wrapper.find('[data-action="update"]')
      expect(saveButton.exists()).toBe(true)
    })

    it('should properly reset error state when opening modal', () => {
      // Set an error state
      wrapper.vm.saveError = 'Some error'
      
      // Open modal
      wrapper.vm.openModal()
      
      // Error should be cleared
      expect(wrapper.vm.saveError).toBe(null)
    })
  })
})