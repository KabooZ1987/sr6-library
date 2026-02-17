import { errorService } from '~/services/errorService'

export default defineNuxtPlugin(() => {
  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message)
    
    errorService.captureError(error, {
      component: 'global',
      action: 'javascript-error',
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        source: 'window.error'
      }
    }, 'high')
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    
    errorService.captureError(error, {
      component: 'global',
      action: 'unhandled-promise-rejection',
      metadata: {
        source: 'window.unhandledrejection'
      }
    }, 'high')
  })

  // Handle Vue errors (if available)
  if (process.client) {
    const app = getCurrentInstance()?.appContext.app
    if (app) {
      app.config.errorHandler = (error: Error, instance: any, info: string) => {
        errorService.captureError(error, {
          component: instance?.$options.name || instance?.$options.__name || 'unknown-vue-component',
          action: 'vue-error',
          metadata: {
            info,
            source: 'vue.errorHandler'
          }
        }, 'high')
      }
    }
  }

  // Provide error service globally
  return {
    provide: {
      errorService
    }
  }
})