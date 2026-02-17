import { useToast } from 'primevue/usetoast'

export interface ToastOptions {
  severity?: 'success' | 'info' | 'warn' | 'error'
  summary?: string
  detail?: string
  life?: number
  closable?: boolean
  group?: string
}

export class ToastService {
  private toast: ReturnType<typeof useToast> | null = null

  constructor() {
    // Initialization is deferred to getToast() or manual setToast()
  }

  setToast(instance: any) {
    this.toast = instance
  }

  private getToast() {
    if (!this.toast && process.client) {
      try {
        this.toast = useToast()
        if (!this.toast) {
          console.warn('ToastService: useToast() returned null. Ensure Toast component is in your app.')
        }
      } catch (e) {
        // useToast() must be called in a setup context
        console.error('ToastService error: useToast must be called in a setup context. Ensure you call useToastService() inside <script setup>.')
      }
    }
    return this.toast
  }

  success(message: string, detail?: string, options?: Partial<ToastOptions>) {
    const toast = this.getToast()
    if (toast) {
      toast.add({
        severity: 'success',
        summary: message,
        detail,
        life: options?.life || 3000,
        closable: options?.closable !== false,
        group: options?.group || 'default',
        ...options
      })
    }
  }

  error(message: string, detail?: string, options?: Partial<ToastOptions>) {
    const toast = this.getToast()
    if (toast) {
      toast.add({
        severity: 'error',
        summary: message,
        detail,
        life: options?.life || 5000,
        closable: options?.closable !== false,
        group: options?.group || 'default',
        ...options
      })
    }
  }

  warn(message: string, detail?: string, options?: Partial<ToastOptions>) {
    const toast = this.getToast()
    if (toast) {
      toast.add({
        severity: 'warn',
        summary: message,
        detail,
        life: options?.life || 4000,
        closable: options?.closable !== false,
        group: options?.group || 'default',
        ...options
      })
    }
  }

  info(message: string, detail?: string, options?: Partial<ToastOptions>) {
    const toast = this.getToast()
    if (toast) {
      toast.add({
        severity: 'info',
        summary: message,
        detail,
        life: options?.life || 3000,
        closable: options?.closable !== false,
        group: options?.group || 'default',
        ...options
      })
    }
  }

  clear(group?: string) {
    const toast = this.getToast()
    if (toast) {
      toast.removeGroup(group || 'default')
    }
  }

  clearAll() {
    const toast = this.getToast()
    if (toast) {
      toast.removeAllGroups()
    }
  }
}

// Create a singleton instance
export const toastService = new ToastService()

// Composable for easy use in components
export function useToastService() {
  if (process.client) {
    try {
      const toast = useToast()
      if (toast) {
        toastService.setToast(toast)
      } else {
        console.warn('useToastService: useToast() returned null. Toast may not show.')
      }
    } catch (e) {
      // Gracefully handle if called outside of setup context
      console.error('useToastService must be called in a setup context.')
    }
  }
  return toastService
}