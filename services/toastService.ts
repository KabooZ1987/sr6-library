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
    // Initialize toast in a composable context
    if (process.client) {
      this.toast = useToast()
    }
  }

  private getToast() {
    if (!this.toast && process.client) {
      this.toast = useToast()
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
  return toastService
}