<template>
  <ConfirmDialog 
    :group="group"
    :breakpoints="{ '1024px': '85vw', '768px': '95vw', '480px': '98vw' }"
    :style="{ width: '90vw', maxWidth: '500px' }"
    class="confirmation-dialog"
  >
    <template #container="{ message, acceptCallback, rejectCallback }">
      <div class="confirmation-content">
        <div class="confirmation-header">
          <div class="confirmation-icon" :class="getIconClass(message.severity)">
            <i :class="getIconName(message.severity)"></i>
          </div>
          <h3 class="confirmation-title">{{ message.header || 'Confirmation' }}</h3>
        </div>
        
        <div class="confirmation-body">
          <p class="confirmation-message">{{ message.message }}</p>
          <div v-if="message.detail" class="confirmation-detail">
            {{ message.detail }}
          </div>
        </div>
        
        <div class="confirmation-footer">
          <Button
            :label="message.rejectLabel || 'Cancel'"
            severity="secondary"
            outlined
            @click="rejectCallback"
            class="confirmation-btn cancel-btn"
            :class="{ 'touch-friendly': isMobile }"
          />
          <Button
            :label="message.acceptLabel || 'Confirm'"
            :severity="message.severity || 'danger'"
            @click="acceptCallback"
            class="confirmation-btn confirm-btn"
            :class="{ 'touch-friendly': isMobile }"
            autofocus
          />
        </div>
      </div>
    </template>
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  group?: string
}

const props = withDefaults(defineProps<Props>(), {
  group: 'default'
})

const isMobile = ref(false)

function getIconClass(severity?: string): string {
  switch (severity) {
    case 'success':
      return 'icon-success'
    case 'info':
      return 'icon-info'
    case 'warn':
      return 'icon-warn'
    case 'error':
    case 'danger':
      return 'icon-danger'
    default:
      return 'icon-danger'
  }
}

function getIconName(severity?: string): string {
  switch (severity) {
    case 'success':
      return 'pi pi-check-circle'
    case 'info':
      return 'pi pi-info-circle'
    case 'warn':
      return 'pi pi-exclamation-triangle'
    case 'error':
    case 'danger':
      return 'pi pi-times-circle'
    default:
      return 'pi pi-question-circle'
  }
}

function updateScreenSize() {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
.confirmation-dialog :deep(.p-confirmdialog) {
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.confirmation-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.confirmation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.confirmation-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirmation-icon i {
  font-size: 1.5rem;
}

.icon-success {
  background-color: #dcfce7;
  color: #16a34a;
}

.icon-info {
  background-color: #dbeafe;
  color: #2563eb;
}

.icon-warn {
  background-color: #fef3c7;
  color: #d97706;
}

.icon-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.confirmation-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.confirmation-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.confirmation-message {
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--text-color);
}

.confirmation-detail {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  background: var(--surface-50);
  padding: 0.75rem;
  border-radius: 0.5rem;
  border-left: 4px solid var(--primary-color);
}

.confirmation-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.confirmation-btn {
  min-width: 5rem;
  padding: 0.75rem 1.5rem;
}

.confirmation-btn.touch-friendly {
  min-height: 2.75rem;
  min-width: 6rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .confirmation-content {
    padding: 1rem;
    gap: 1rem;
  }
  
  .confirmation-header {
    gap: 0.75rem;
  }
  
  .confirmation-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .confirmation-icon i {
    font-size: 1.25rem;
  }
  
  .confirmation-title {
    font-size: 1.125rem;
  }
  
  .confirmation-message {
    font-size: 0.95rem;
  }
  
  .confirmation-detail {
    font-size: 0.8rem;
    padding: 0.5rem;
  }
  
  .confirmation-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }
  
  .confirmation-btn {
    width: 100%;
    min-height: 2.75rem;
    font-size: 1rem;
    justify-content: center;
  }
  
  .confirmation-dialog :deep(.p-confirmdialog) {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

@media (max-width: 480px) {
  .confirmation-content {
    padding: 0.75rem;
  }
  
  .confirmation-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .confirmation-title {
    font-size: 1rem;
  }
  
  .confirmation-message {
    font-size: 0.9rem;
    text-align: center;
  }
  
  .confirmation-detail {
    font-size: 0.75rem;
    text-align: left;
  }
  
  .confirmation-dialog :deep(.p-confirmdialog) {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }
}

/* Focus states for accessibility */
.confirmation-btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Animation improvements */
.confirmation-dialog :deep(.p-confirmdialog-enter-active) {
  transition: all 0.3s ease-out;
}

.confirmation-dialog :deep(.p-confirmdialog-leave-active) {
  transition: all 0.2s ease-in;
}

.confirmation-dialog :deep(.p-confirmdialog-enter-from) {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.confirmation-dialog :deep(.p-confirmdialog-leave-to) {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>