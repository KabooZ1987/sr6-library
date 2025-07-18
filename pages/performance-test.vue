<template>
  <div class="performance-test-page">
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">Performance Optimizations & Error Handling Test</h1>
      
      <!-- Test Controls -->
      <div class="test-controls mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Test Controls</h2>
        <div class="flex flex-wrap gap-4">
          <Button
            label="Toggle Loading"
            @click="toggleLoading"
            :severity="isLoading ? 'danger' : 'success'"
          />
          <Button
            label="Show Success Toast"
            @click="showSuccessToast"
            severity="success"
          />
          <Button
            label="Show Error Toast"
            @click="showErrorToast"
            severity="danger"
          />
          <Button
            label="Test Confirmation"
            @click="testConfirmation"
            severity="warning"
          />
          <Button
            label="Trigger Error"
            @click="triggerError"
            severity="danger"
            outlined
          />
        </div>
      </div>

      <!-- Error Boundary Test -->
      <ErrorBoundary
        :show-details="true"
        :show-report-button="true"
        @error="handleError"
        @retry="handleRetry"
        @report="handleReport"
      >
        <!-- OptimizedDataTable Test -->
        <div class="table-test mb-8">
          <h2 class="text-xl font-semibold mb-4">OptimizedDataTable with Performance Features</h2>
          <OptimizedDataTable
            :data="testData"
            data-type="commonActions"
            :loading="isLoading"
            :searchable="true"
            :filterable="true"
            @view="handleView"
            @edit="handleEdit"
            @delete="handleDelete"
            @retry="handleTableRetry"
          />
        </div>
      </ErrorBoundary>

      <!-- DetailModal Test -->
      <DetailModal
        :visible="showModal"
        :item="selectedItem"
        :loading="modalLoading"
        :show-edit-button="true"
        :show-navigation="true"
        :has-previous="selectedIndex > 0"
        :has-next="selectedIndex < testData.length - 1"
        @close="closeModal"
        @edit="handleModalEdit"
        @navigate="handleNavigate"
      />

      <!-- Test Results -->
      <div class="test-results mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Test Results</h2>
        <div class="space-y-2">
          <div v-for="result in testResults" :key="result.id" class="text-sm">
            <span class="font-medium">{{ result.timestamp }}:</span>
            <span :class="getResultClass(result.type)">{{ result.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToastService } from '~/services/toastService'
import { useConfirm } from 'primevue/useconfirm'

// Services
const toastService = useToastService()
const confirm = useConfirm()

// Reactive data
const isLoading = ref(false)
const showModal = ref(false)
const modalLoading = ref(false)
const selectedItem = ref(null)
const selectedIndex = ref(0)
const testResults = ref<Array<{ id: number, timestamp: string, type: string, message: string }>>([])
const shouldTriggerError = ref(false)

// Test data
const testData = ref([
  {
    id: 1,
    name: 'Aimed Shot',
    type: 'Simple Action',
    attribute: 'Agility',
    skill: 'Firearms',
    cost: 0,
    description: 'Take careful aim to increase accuracy',
    homebrew: false
  },
  {
    id: 2,
    name: 'Full Defense',
    type: 'Complex Action',
    attribute: 'Reaction',
    skill: 'Gymnastics',
    cost: 0,
    description: 'Focus entirely on defense',
    homebrew: false
  },
  {
    id: 3,
    name: 'Sprint',
    type: 'Complex Action',
    attribute: 'Agility',
    skill: 'Running',
    cost: 0,
    description: 'Run at maximum speed',
    homebrew: true
  },
  {
    id: 4,
    name: 'Custom Action',
    type: 'Free Action',
    attribute: 'Charisma',
    skill: 'Leadership',
    cost: 1,
    description: 'A custom homebrew action for testing purposes with a longer description to test text wrapping and display',
    homebrew: true
  }
])

// Methods
function toggleLoading() {
  isLoading.value = !isLoading.value
  addTestResult('info', `Loading state: ${isLoading.value ? 'ON' : 'OFF'}`)
}

function showSuccessToast() {
  toastService.success('Success!', 'This is a success message')
  addTestResult('success', 'Success toast displayed')
}

function showErrorToast() {
  toastService.error('Error!', 'This is an error message')
  addTestResult('error', 'Error toast displayed')
}

function testConfirmation() {
  confirm.require({
    message: 'Are you sure you want to proceed with this test?',
    header: 'Test Confirmation',
    icon: 'pi pi-question-circle',
    accept: () => {
      toastService.success('Confirmed!', 'Test confirmation accepted')
      addTestResult('success', 'Confirmation accepted')
    },
    reject: () => {
      toastService.info('Cancelled', 'Test confirmation rejected')
      addTestResult('info', 'Confirmation rejected')
    }
  })
}

function triggerError() {
  shouldTriggerError.value = true
  addTestResult('warning', 'Error trigger activated')
  // This will cause an error in the next render cycle
  setTimeout(() => {
    throw new Error('Test error for ErrorBoundary')
  }, 100)
}

function handleView(item: any) {
  selectedItem.value = item
  selectedIndex.value = testData.value.findIndex(d => d.id === item.id)
  showModal.value = true
  addTestResult('info', `Viewing item: ${item.name}`)
}

function handleEdit(item: any) {
  toastService.info('Edit Mode', `Editing ${item.name}`)
  addTestResult('info', `Edit requested for: ${item.name}`)
}

function handleDelete(item: any) {
  // This is handled by the OptimizedDataTable component with confirmation
  const index = testData.value.findIndex(d => d.id === item.id)
  if (index > -1) {
    testData.value.splice(index, 1)
    addTestResult('success', `Deleted item: ${item.name}`)
  }
}

function handleTableRetry() {
  isLoading.value = true
  addTestResult('info', 'Table retry initiated')
  setTimeout(() => {
    isLoading.value = false
    addTestResult('success', 'Table retry completed')
  }, 2000)
}

function closeModal() {
  showModal.value = false
  selectedItem.value = null
  addTestResult('info', 'Modal closed')
}

function handleModalEdit(item: any) {
  toastService.info('Modal Edit', `Editing ${item.name} from modal`)
  addTestResult('info', `Modal edit for: ${item.name}`)
}

function handleNavigate(direction: 'previous' | 'next') {
  if (direction === 'previous' && selectedIndex.value > 0) {
    selectedIndex.value--
  } else if (direction === 'next' && selectedIndex.value < testData.value.length - 1) {
    selectedIndex.value++
  }
  selectedItem.value = testData.value[selectedIndex.value]
  addTestResult('info', `Navigated ${direction} to: ${selectedItem.value.name}`)
}

function handleError(error: Error, errorInfo: any) {
  addTestResult('error', `Error caught: ${error.message}`)
  console.error('Test page error:', error, errorInfo)
}

function handleRetry() {
  shouldTriggerError.value = false
  addTestResult('info', 'Error boundary retry')
}

function handleReport(error: Error, errorInfo: any) {
  addTestResult('warning', `Error reported: ${error.message}`)
  toastService.info('Error Reported', 'Error has been reported for analysis')
}

function addTestResult(type: string, message: string) {
  const timestamp = new Date().toLocaleTimeString()
  testResults.value.unshift({
    id: Date.now(),
    timestamp,
    type,
    message
  })
  
  // Keep only last 20 results
  if (testResults.value.length > 20) {
    testResults.value = testResults.value.slice(0, 20)
  }
}

function getResultClass(type: string) {
  switch (type) {
    case 'success':
      return 'text-green-600 font-medium'
    case 'error':
      return 'text-red-600 font-medium'
    case 'warning':
      return 'text-orange-600 font-medium'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-gray-600'
  }
}

// Initialize
onMounted(() => {
  addTestResult('info', 'Performance test page loaded')
})

// Trigger error if flag is set
if (shouldTriggerError.value) {
  throw new Error('Intentional test error')
}
</script>

<style scoped>
.performance-test-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.test-controls {
  border: 2px dashed #d1d5db;
}

.test-results {
  max-height: 300px;
  overflow-y: auto;
}

.test-results::-webkit-scrollbar {
  width: 6px;
}

.test-results::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.test-results::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.test-results::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>