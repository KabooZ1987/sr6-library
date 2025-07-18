<template>
  <div class="responsive-demo">
    <div class="demo-header">
      <h2>Responsive Design Demo</h2>
      <div class="screen-info">
        <Badge :value="`Screen: ${screenSize}`" severity="info" />
        <Badge :value="`Width: ${screenWidth}px`" severity="secondary" />
      </div>
    </div>

    <div class="demo-sections">
      <!-- Table Demo -->
      <div class="demo-section">
        <h3>Responsive Data Table</h3>
        <p class="demo-description">
          Table columns are hidden based on screen size priority. 
          Priority 1 columns always visible, higher priorities hidden on smaller screens.
        </p>
        <OptimizedDataTable
          :data="sampleData"
          dataType="commonActions"
          :searchable="true"
          :filterable="true"
          @view="handleView"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- Action Buttons Demo -->
      <div class="demo-section">
        <h3>Responsive Action Buttons</h3>
        <p class="demo-description">
          Desktop: Full buttons with text | Tablet: Icon buttons | Mobile: Dropdown menu
        </p>
        <div class="action-demo">
          <QuickActionButtons
            :item="sampleData[0]"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Form Elements Demo -->
      <div class="demo-section">
        <h3>Responsive Form Elements</h3>
        <p class="demo-description">
          Form elements adapt to touch-friendly sizes on mobile devices.
        </p>
        <div class="form-demo">
          <div class="form-row">
            <ResponsiveFormElements
              type="input"
              label="Name"
              placeholder="Enter name"
              v-model="formData.name"
            />
            <ResponsiveFormElements
              type="dropdown"
              label="Type"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              v-model="formData.type"
            />
          </div>
          <ResponsiveFormElements
            type="textarea"
            label="Description"
            placeholder="Enter description"
            v-model="formData.description"
          />
          <ResponsiveFormElements
            type="button"
            label="Submit"
            severity="primary"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>

    <!-- Modal Demo -->
    <DetailModal
      :visible="showModal"
      :item="selectedItem"
      :modalSections="modalSections"
      @close="showModal = false"
      @edit="handleEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import OptimizedDataTable from './OptimizedDataTable.vue'
import QuickActionButtons from './QuickActionButtons.vue'
import DetailModal from './DetailModal.vue'
import ResponsiveFormElements from './ResponsiveFormElements.vue'

// Reactive data
const screenSize = ref('desktop')
const screenWidth = ref(window.innerWidth)
const showModal = ref(false)
const selectedItem = ref(null)

const formData = ref({
  name: '',
  type: '',
  description: ''
})

const typeOptions = [
  { label: 'Simple Action', value: 'simple' },
  { label: 'Complex Action', value: 'complex' },
  { label: 'Free Action', value: 'free' }
]

const sampleData = [
  {
    id: 1,
    name: 'Aim',
    type: 'Simple',
    attribute: 'Agility',
    skill: 'Firearms',
    description: 'Take careful aim at your target to improve accuracy',
    homebrew: false,
    source: 'Core Rulebook',
    page: 162
  },
  {
    id: 2,
    name: 'Sprint',
    type: 'Complex',
    attribute: 'Body',
    skill: 'Running',
    description: 'Run at maximum speed for a short distance',
    homebrew: true,
    source: 'Homebrew',
    page: null
  },
  {
    id: 3,
    name: 'Take Cover',
    type: 'Simple',
    attribute: 'Reaction',
    skill: 'Athletics',
    description: 'Quickly move behind available cover',
    homebrew: false,
    source: 'Core Rulebook',
    page: 165
  }
]

const modalSections = [
  {
    title: 'Basic Information',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'attribute', label: 'Attribute', type: 'text' },
      { key: 'skill', label: 'Skill', type: 'text' }
    ]
  },
  {
    title: 'Details',
    fields: [
      { key: 'description', label: 'Description', type: 'markdown' },
      { key: 'homebrew', label: 'Homebrew', type: 'boolean' }
    ]
  },
  {
    title: 'Source Information',
    fields: [
      { key: 'source', label: 'Source', type: 'text' },
      { key: 'page', label: 'Page', type: 'number' }
    ]
  }
]

// Methods
function updateScreenSize() {
  const width = window.innerWidth
  screenWidth.value = width
  
  if (width <= 480) {
    screenSize.value = 'mobile-xs'
  } else if (width <= 767) {
    screenSize.value = 'mobile'
  } else if (width <= 1023) {
    screenSize.value = 'tablet'
  } else {
    screenSize.value = 'desktop'
  }
}

function handleView(item: any) {
  selectedItem.value = item
  showModal.value = true
}

function handleEdit(item: any) {
  console.log('Edit item:', item)
}

function handleDelete(item: any) {
  console.log('Delete item:', item)
}

function handleSubmit() {
  console.log('Form submitted:', formData.value)
}

// Lifecycle
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.responsive-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.demo-header h2 {
  margin: 0;
  color: var(--text-color);
}

.screen-info {
  display: flex;
  gap: 0.5rem;
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.demo-section {
  background: var(--surface-0);
  border: 1px solid var(--surface-border);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.demo-section h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.25rem;
}

.demo-description {
  margin: 0 0 1.5rem 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.action-demo {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: var(--surface-50);
  border-radius: 0.375rem;
}

.form-demo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .responsive-demo {
    padding: 1rem;
  }
  
  .demo-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .screen-info {
    align-self: stretch;
    justify-content: center;
  }
  
  .demo-section {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .action-demo {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .responsive-demo {
    padding: 0.5rem;
  }
  
  .demo-section {
    padding: 0.75rem;
  }
  
  .demo-section h3 {
    font-size: 1.1rem;
  }
  
  .demo-description {
    font-size: 0.85rem;
  }
}
</style>