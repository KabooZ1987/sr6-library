import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AccessibilityAuditor, auditAccessibility } from '../accessibilityAudit'

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockReturnValue({
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgb(255, 255, 255)',
    fontSize: '16px',
    fontWeight: 'normal',
    outline: '2px solid blue',
    outlineWidth: '2px',
    boxShadow: 'none'
  })
})

describe('AccessibilityAuditor', () => {
  let container: HTMLElement
  let auditor: AccessibilityAuditor

  beforeEach(() => {
    // Create a clean container for each test
    container = document.createElement('div')
    document.body.appendChild(container)
    
    auditor = new AccessibilityAuditor({
      includeWarnings: true,
      includeInfo: true,
      checkColorContrast: true,
      checkKeyboardNavigation: true,
      checkAriaLabels: true,
      checkFocusManagement: true,
      checkStructure: true
    })
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  describe('ARIA Label Checking', () => {
    it('should detect buttons without accessible names', async () => {
      const button = document.createElement('button')
      container.appendChild(button)

      const result = await auditor.audit(container)
      
      const buttonIssues = result.issues.filter(issue => 
        issue.message.includes('Button lacks accessible name')
      )
      
      expect(buttonIssues).toHaveLength(1)
      expect(buttonIssues[0].type).toBe('error')
      expect(buttonIssues[0].category).toBe('aria')
    })

    it('should not flag buttons with accessible names', async () => {
      const button = document.createElement('button')
      button.setAttribute('aria-label', 'Save document')
      container.appendChild(button)

      const result = await auditor.audit(container)
      
      const buttonIssues = result.issues.filter(issue => 
        issue.message.includes('Button lacks accessible name')
      )
      
      expect(buttonIssues).toHaveLength(0)
    })

    it('should detect links without accessible names', async () => {
      const link = document.createElement('a')
      link.href = '#'
      container.appendChild(link)

      const result = await auditor.audit(container)
      
      const linkIssues = result.issues.filter(issue => 
        issue.message.includes('Link lacks accessible name')
      )
      
      expect(linkIssues).toHaveLength(1)
      expect(linkIssues[0].type).toBe('error')
    })

    it('should detect form inputs without labels', async () => {
      const input = document.createElement('input')
      input.type = 'text'
      container.appendChild(input)

      const result = await auditor.audit(container)
      
      const inputIssues = result.issues.filter(issue => 
        issue.message.includes('Form control lacks associated label')
      )
      
      expect(inputIssues).toHaveLength(1)
      expect(inputIssues[0].type).toBe('error')
    })

    it('should detect images without alt attributes', async () => {
      const img = document.createElement('img')
      img.src = 'test.jpg'
      container.appendChild(img)

      const result = await auditor.audit(container)
      
      const imgIssues = result.issues.filter(issue => 
        issue.message.includes('Image lacks alt attribute')
      )
      
      expect(imgIssues).toHaveLength(1)
      expect(imgIssues[0].type).toBe('error')
    })
  })

  describe('Keyboard Navigation Checking', () => {
    it('should detect positive tabindex values', async () => {
      const button = document.createElement('button')
      button.setAttribute('tabindex', '5')
      button.textContent = 'Test Button'
      container.appendChild(button)

      const result = await auditor.audit(container)
      
      const tabindexIssues = result.issues.filter(issue => 
        issue.message.includes('Positive tabindex values should be avoided')
      )
      
      expect(tabindexIssues).toHaveLength(1)
      expect(tabindexIssues[0].type).toBe('warning')
    })

    it('should detect non-interactive clickable elements', async () => {
      const div = document.createElement('div')
      div.setAttribute('onclick', 'doSomething()')
      container.appendChild(div)

      const result = await auditor.audit(container)
      
      const clickableIssues = result.issues.filter(issue => 
        issue.message.includes('Clickable element is not keyboard accessible')
      )
      
      expect(clickableIssues).toHaveLength(1)
      expect(clickableIssues[0].type).toBe('error')
    })
  })

  describe('Structure Checking', () => {
    it('should detect missing page title', async () => {
      // Clear existing title
      document.title = ''
      
      const result = await auditor.audit(document.body)
      
      const titleIssues = result.issues.filter(issue => 
        issue.message.includes('Page lacks descriptive title')
      )
      
      expect(titleIssues).toHaveLength(1)
      expect(titleIssues[0].type).toBe('error')
    })

    it('should detect missing language attribute', async () => {
      // Remove lang attribute
      document.documentElement.removeAttribute('lang')
      
      const result = await auditor.audit(document.body)
      
      const langIssues = result.issues.filter(issue => 
        issue.message.includes('Document lacks language attribute')
      )
      
      expect(langIssues).toHaveLength(1)
      expect(langIssues[0].type).toBe('error')
    })
  })

  describe('Score Calculation', () => {
    it('should calculate accessibility score correctly', async () => {
      // Add elements with various issues
      const button = document.createElement('button') // Missing label (error)
      const img = document.createElement('img') // Missing alt (error)
      img.src = 'test.jpg'
      
      container.appendChild(button)
      container.appendChild(img)

      const result = await auditor.audit(container)
      
      expect(result.score).toBeLessThan(100)
      expect(result.summary.errors).toBeGreaterThan(0)
    })

    it('should give perfect score for accessible content', async () => {
      const button = document.createElement('button')
      button.setAttribute('aria-label', 'Accessible button')
      button.textContent = 'Click me'
      
      const img = document.createElement('img')
      img.src = 'test.jpg'
      img.alt = 'Test image'
      
      container.appendChild(button)
      container.appendChild(img)

      const result = await auditor.audit(container)
      
      expect(result.score).toBe(100)
      expect(result.summary.errors).toBe(0)
    })
  })

  describe('Auto-fix Functionality', () => {
    it('should auto-fix missing alt attributes', async () => {
      const img = document.createElement('img')
      img.src = 'test.jpg'
      container.appendChild(img)

      const result = await auditor.audit(container)
      const fixed = await auditor.autoFix(result.issues)
      
      expect(img.getAttribute('alt')).toBe('')
      expect(fixed.length).toBeGreaterThan(0)
    })

    it('should auto-fix missing language attribute', async () => {
      document.documentElement.removeAttribute('lang')
      
      const result = await auditor.audit(document.body)
      const langIssues = result.issues.filter(issue => 
        issue.message.includes('language attribute')
      )
      
      if (langIssues.length > 0) {
        await auditor.autoFix(langIssues)
        expect(document.documentElement.getAttribute('lang')).toBe('en')
      }
    })
  })
})

describe('Convenience Functions', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('should provide quick audit functionality', async () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    const result = await auditAccessibility()
    
    expect(result.issues).toBeDefined()
    expect(result.score).toBeDefined()
    expect(result.summary).toBeDefined()
  })

  it('should handle custom options', async () => {
    const result = await auditAccessibility(document.body, {
      includeWarnings: false,
      includeInfo: false
    })
    
    // Should only include errors
    const hasNonErrors = result.issues.some(issue => issue.type !== 'error')
    expect(hasNonErrors).toBe(false)
  })
})