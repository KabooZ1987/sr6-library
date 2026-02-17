export interface AccessibilityIssue {
  element: HTMLElement
  type: 'error' | 'warning' | 'info'
  category: 'aria' | 'keyboard' | 'color' | 'focus' | 'structure' | 'content'
  message: string
  suggestion: string
  wcagLevel: 'A' | 'AA' | 'AAA'
  wcagCriterion: string
}

export interface AccessibilityAuditResult {
  issues: AccessibilityIssue[]
  score: number
  summary: {
    errors: number
    warnings: number
    infos: number
  }
}

export interface AccessibilityAuditOptions {
  includeWarnings?: boolean
  includeInfo?: boolean
  checkColorContrast?: boolean
  checkKeyboardNavigation?: boolean
  checkAriaLabels?: boolean
  checkFocusManagement?: boolean
  checkStructure?: boolean
}

export class AccessibilityAuditor {
  private options: Required<AccessibilityAuditOptions>

  constructor(options: AccessibilityAuditOptions = {}) {
    this.options = {
      includeWarnings: true,
      includeInfo: true,
      checkColorContrast: true,
      checkKeyboardNavigation: true,
      checkAriaLabels: true,
      checkFocusManagement: true,
      checkStructure: true,
      ...options
    }
  }

  async audit(container: HTMLElement = document.body): Promise<AccessibilityAuditResult> {
    const issues: AccessibilityIssue[] = []

    // Check ARIA labels and attributes
    if (this.options.checkAriaLabels) {
      issues.push(...this.checkAriaLabels(container))
    }

    // Check keyboard navigation
    if (this.options.checkKeyboardNavigation) {
      issues.push(...this.checkKeyboardNavigation(container))
    }

    // Check color contrast
    if (this.options.checkColorContrast) {
      issues.push(...await this.checkColorContrast(container))
    }

    // Check focus management
    if (this.options.checkFocusManagement) {
      issues.push(...this.checkFocusManagement(container))
    }

    // Check document structure
    if (this.options.checkStructure) {
      issues.push(...this.checkStructure(container))
    }

    // Filter issues based on options
    const filteredIssues = issues.filter(issue => {
      if (issue.type === 'error') return true
      if (issue.type === 'warning') return this.options.includeWarnings
      if (issue.type === 'info') return this.options.includeInfo
      return false
    })

    // Calculate score
    const score = this.calculateScore(filteredIssues)

    // Generate summary
    const summary = {
      errors: filteredIssues.filter(i => i.type === 'error').length,
      warnings: filteredIssues.filter(i => i.type === 'warning').length,
      infos: filteredIssues.filter(i => i.type === 'info').length
    }

    return {
      issues: filteredIssues,
      score,
      summary
    }
  }

  private checkAriaLabels(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check buttons without accessible names
    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      const hasAccessibleName = this.hasAccessibleName(button)
      if (!hasAccessibleName) {
        issues.push({
          element: button,
          type: 'error',
          category: 'aria',
          message: 'Button lacks accessible name',
          suggestion: 'Add aria-label, aria-labelledby, or visible text content',
          wcagLevel: 'A',
          wcagCriterion: '4.1.2 Name, Role, Value'
        })
      }
    })

    // Check links without accessible names
    const links = container.querySelectorAll('a')
    links.forEach(link => {
      const hasAccessibleName = this.hasAccessibleName(link)
      if (!hasAccessibleName) {
        issues.push({
          element: link,
          type: 'error',
          category: 'aria',
          message: 'Link lacks accessible name',
          suggestion: 'Add aria-label, aria-labelledby, or visible text content',
          wcagLevel: 'A',
          wcagCriterion: '2.4.4 Link Purpose'
        })
      }
    })

    // Check form inputs without labels
    const inputs = container.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      if (input.getAttribute('type') === 'hidden') return
      
      const hasLabel = this.hasFormLabel(input as HTMLInputElement)
      if (!hasLabel) {
        issues.push({
          element: input,
          type: 'error',
          category: 'aria',
          message: 'Form control lacks associated label',
          suggestion: 'Add <label> element, aria-label, or aria-labelledby',
          wcagLevel: 'A',
          wcagCriterion: '3.3.2 Labels or Instructions'
        })
      }
    })

    // Check images without alt text
    const images = container.querySelectorAll('img')
    images.forEach(img => {
      const alt = img.getAttribute('alt')
      if (alt === null) {
        issues.push({
          element: img,
          type: 'error',
          category: 'content',
          message: 'Image lacks alt attribute',
          suggestion: 'Add alt attribute with descriptive text or empty alt="" for decorative images',
          wcagLevel: 'A',
          wcagCriterion: '1.1.1 Non-text Content'
        })
      }
    })

    // Check for proper heading structure
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))
    if (headings.length > 0) {
      let previousLevel = 0
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1))
        if (level > previousLevel + 1) {
          issues.push({
            element: heading,
            type: 'warning',
            category: 'structure',
            message: `Heading level skipped (h${previousLevel} to h${level})`,
            suggestion: 'Use heading levels in sequential order',
            wcagLevel: 'AA',
            wcagCriterion: '1.3.1 Info and Relationships'
          })
        }
        previousLevel = level
      })
    }

    return issues
  }

  private checkKeyboardNavigation(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for focusable elements with tabindex="-1" that shouldn't have it
    const focusableElements = container.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]'
    )

    focusableElements.forEach(element => {
      const tabindex = element.getAttribute('tabindex')
      
      // Check for positive tabindex values (anti-pattern)
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push({
          element: element,
          type: 'warning',
          category: 'keyboard',
          message: 'Positive tabindex values should be avoided',
          suggestion: 'Use tabindex="0" or remove tabindex to use natural tab order',
          wcagLevel: 'A',
          wcagCriterion: '2.4.3 Focus Order'
        })
      }

      // Check for elements that should be focusable but aren't
      if (element.tagName === 'BUTTON' && tabindex === '-1') {
        issues.push({
          element: element,
          type: 'warning',
          category: 'keyboard',
          message: 'Interactive button is not keyboard accessible',
          suggestion: 'Remove tabindex="-1" or ensure alternative keyboard access',
          wcagLevel: 'A',
          wcagCriterion: '2.1.1 Keyboard'
        })
      }
    })

    // Check for click handlers on non-interactive elements
    const clickableElements = container.querySelectorAll('[onclick], [data-click]')
    clickableElements.forEach(element => {
      const tagName = element.tagName.toLowerCase()
      const role = element.getAttribute('role')
      
      if (!['button', 'a', 'input', 'select', 'textarea'].includes(tagName) && 
          !['button', 'link', 'menuitem'].includes(role || '')) {
        issues.push({
          element: element,
          type: 'error',
          category: 'keyboard',
          message: 'Clickable element is not keyboard accessible',
          suggestion: 'Use button element or add role="button" with keyboard event handlers',
          wcagLevel: 'A',
          wcagCriterion: '2.1.1 Keyboard'
        })
      }
    })

    return issues
  }

  private async checkColorContrast(container: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = []

    // Get all text elements
    const textElements = this.getTextElements(container)

    for (const element of textElements) {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = this.getEffectiveBackgroundColor(element)

      if (color && backgroundColor) {
        const contrast = this.calculateContrastRatio(color, backgroundColor)
        const fontSize = parseFloat(styles.fontSize)
        const fontWeight = styles.fontWeight

        // Determine if text is large (18pt+ or 14pt+ bold)
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))
        const minRatio = isLargeText ? 3 : 4.5

        if (contrast < minRatio) {
          issues.push({
            element: element,
            type: 'error',
            category: 'color',
            message: `Insufficient color contrast (${contrast.toFixed(2)}:1, minimum ${minRatio}:1)`,
            suggestion: 'Increase contrast between text and background colors',
            wcagLevel: 'AA',
            wcagCriterion: '1.4.3 Contrast (Minimum)'
          })
        } else if (contrast < 7 && !isLargeText) {
          issues.push({
            element: element,
            type: 'info',
            category: 'color',
            message: `Color contrast could be improved for AAA compliance (${contrast.toFixed(2)}:1, recommended 7:1)`,
            suggestion: 'Consider increasing contrast for better accessibility',
            wcagLevel: 'AAA',
            wcagCriterion: '1.4.6 Contrast (Enhanced)'
          })
        }
      }
    }

    return issues
  }

  private checkFocusManagement(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for focus indicators
    const focusableElements = container.querySelectorAll(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach(element => {
      const styles = window.getComputedStyle(element, ':focus')
      const outline = styles.outline
      const outlineWidth = styles.outlineWidth
      const boxShadow = styles.boxShadow

      // Check if element has visible focus indicator
      if (outline === 'none' && outlineWidth === '0px' && !boxShadow.includes('inset')) {
        issues.push({
          element: element,
          type: 'warning',
          category: 'focus',
          message: 'Element may lack visible focus indicator',
          suggestion: 'Ensure focus states are clearly visible with outline or box-shadow',
          wcagLevel: 'AA',
          wcagCriterion: '2.4.7 Focus Visible'
        })
      }
    })

    // Check for skip links
    const skipLinks = container.querySelectorAll('a[href^="#"]')
    const hasSkipToMain = Array.from(skipLinks).some(link => 
      link.textContent?.toLowerCase().includes('skip') && 
      link.textContent?.toLowerCase().includes('main')
    )

    if (!hasSkipToMain && container === document.body) {
      issues.push({
        element: container,
        type: 'info',
        category: 'focus',
        message: 'Consider adding skip navigation links',
        suggestion: 'Add "Skip to main content" link at the beginning of the page',
        wcagLevel: 'A',
        wcagCriterion: '2.4.1 Bypass Blocks'
      })
    }

    return issues
  }

  private checkStructure(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for landmark roles
    const landmarks = container.querySelectorAll('main, nav, aside, header, footer, [role="main"], [role="navigation"], [role="complementary"], [role="banner"], [role="contentinfo"]')
    
    if (landmarks.length === 0 && container === document.body) {
      issues.push({
        element: container,
        type: 'warning',
        category: 'structure',
        message: 'Page lacks landmark elements',
        suggestion: 'Add semantic HTML5 elements (main, nav, header, footer) or ARIA landmark roles',
        wcagLevel: 'AA',
        wcagCriterion: '1.3.1 Info and Relationships'
      })
    }

    // Check for page title
    if (container === document.body && !document.title.trim()) {
      issues.push({
        element: document.head,
        type: 'error',
        category: 'structure',
        message: 'Page lacks descriptive title',
        suggestion: 'Add meaningful <title> element to document head',
        wcagLevel: 'A',
        wcagCriterion: '2.4.2 Page Titled'
      })
    }

    // Check for language attribute
    if (container === document.body && !document.documentElement.getAttribute('lang')) {
      issues.push({
        element: document.documentElement,
        type: 'error',
        category: 'structure',
        message: 'Document lacks language attribute',
        suggestion: 'Add lang attribute to html element (e.g., lang="en")',
        wcagLevel: 'A',
        wcagCriterion: '3.1.1 Language of Page'
      })
    }

    return issues
  }

  private hasAccessibleName(element: HTMLElement): boolean {
    // Check for aria-label
    if (element.getAttribute('aria-label')?.trim()) return true
    
    // Check for aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby')
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy)
      if (labelElement?.textContent?.trim()) return true
    }
    
    // Check for visible text content
    if (element.textContent?.trim()) return true
    
    // Check for alt text on images
    if (element.tagName === 'IMG' && element.getAttribute('alt')?.trim()) return true
    
    // Check for title attribute (less preferred)
    if (element.getAttribute('title')?.trim()) return true
    
    return false
  }

  private hasFormLabel(input: HTMLInputElement): boolean {
    // Check for aria-label
    if (input.getAttribute('aria-label')?.trim()) return true
    
    // Check for aria-labelledby
    const labelledBy = input.getAttribute('aria-labelledby')
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy)
      if (labelElement?.textContent?.trim()) return true
    }
    
    // Check for associated label element
    const id = input.id
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`)
      if (label?.textContent?.trim()) return true
    }
    
    // Check for wrapping label
    const parentLabel = input.closest('label')
    if (parentLabel?.textContent?.trim()) return true
    
    return false
  }

  private getTextElements(container: HTMLElement): HTMLElement[] {
    const textElements: HTMLElement[] = []
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          
          const text = node.textContent?.trim()
          if (!text) return NodeFilter.FILTER_REJECT
          
          // Skip script and style elements
          const tagName = parent.tagName.toLowerCase()
          if (['script', 'style', 'noscript'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT
          }
          
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )
    
    let node
    while (node = walker.nextNode()) {
      const parent = node.parentElement
      if (parent && !textElements.includes(parent)) {
        textElements.push(parent)
      }
    }
    
    return textElements
  }

  private getEffectiveBackgroundColor(element: HTMLElement): string | null {
    let current: HTMLElement | null = element
    
    while (current && current !== document.body) {
      const styles = window.getComputedStyle(current)
      const bgColor = styles.backgroundColor
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        return bgColor
      }
      
      current = current.parentElement
    }
    
    // Default to white background
    return 'rgb(255, 255, 255)'
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.parseColor(color1)
    const rgb2 = this.parseColor(color2)
    
    if (!rgb1 || !rgb2) return 0
    
    const l1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const l2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }

  private parseColor(color: string): { r: number; g: number; b: number } | null {
    // Handle rgb() format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
      }
    }
    
    // Handle rgba() format
    const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/)
    if (rgbaMatch) {
      return {
        r: parseInt(rgbaMatch[1]),
        g: parseInt(rgbaMatch[2]),
        b: parseInt(rgbaMatch[3])
      }
    }
    
    // Handle hex format
    const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (hexMatch) {
      return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
      }
    }
    
    return null
  }

  private getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private calculateScore(issues: AccessibilityIssue[]): number {
    const errorWeight = 10
    const warningWeight = 5
    const infoWeight = 1
    
    const totalDeductions = issues.reduce((sum, issue) => {
      switch (issue.type) {
        case 'error': return sum + errorWeight
        case 'warning': return sum + warningWeight
        case 'info': return sum + infoWeight
        default: return sum
      }
    }, 0)
    
    // Start with 100 and deduct points
    const score = Math.max(0, 100 - totalDeductions)
    return Math.round(score)
  }

  // Auto-fix methods
  async autoFix(issues: AccessibilityIssue[]): Promise<AccessibilityIssue[]> {
    const fixedIssues: AccessibilityIssue[] = []
    
    for (const issue of issues) {
      const fixed = await this.attemptAutoFix(issue)
      if (fixed) {
        fixedIssues.push(issue)
      }
    }
    
    return fixedIssues
  }

  private async attemptAutoFix(issue: AccessibilityIssue): Promise<boolean> {
    try {
      switch (issue.category) {
        case 'aria':
          return this.fixAriaIssue(issue)
        case 'structure':
          return this.fixStructureIssue(issue)
        case 'focus':
          return this.fixFocusIssue(issue)
        default:
          return false
      }
    } catch (error) {
      console.warn('Failed to auto-fix accessibility issue:', error)
      return false
    }
  }

  private fixAriaIssue(issue: AccessibilityIssue): boolean {
    const element = issue.element
    
    // Auto-fix missing button labels
    if (element.tagName === 'BUTTON' && !this.hasAccessibleName(element)) {
      const text = element.textContent?.trim()
      if (text) {
        element.setAttribute('aria-label', text)
        return true
      }
    }
    
    // Auto-fix missing alt attributes
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      element.setAttribute('alt', '')
      return true
    }
    
    return false
  }

  private fixStructureIssue(issue: AccessibilityIssue): boolean {
    // Auto-fix missing language attribute
    if (issue.message.includes('language attribute')) {
      document.documentElement.setAttribute('lang', 'en')
      return true
    }
    
    return false
  }

  private fixFocusIssue(issue: AccessibilityIssue): boolean {
    const element = issue.element
    
    // Auto-fix missing focus indicators
    if (issue.message.includes('focus indicator')) {
      element.style.setProperty('outline', '2px solid #007bff', 'important')
      element.style.setProperty('outline-offset', '2px', 'important')
      return true
    }
    
    return false
  }
}

// Convenience function for quick audits
export async function auditAccessibility(
  container?: HTMLElement,
  options?: AccessibilityAuditOptions
): Promise<AccessibilityAuditResult> {
  const auditor = new AccessibilityAuditor(options)
  return auditor.audit(container)
}

// Convenience function for auto-fixing issues
export async function autoFixAccessibility(
  container?: HTMLElement,
  options?: AccessibilityAuditOptions
): Promise<{ result: AccessibilityAuditResult; fixed: AccessibilityIssue[] }> {
  const auditor = new AccessibilityAuditor(options)
  const result = await auditor.audit(container)
  const fixed = await auditor.autoFix(result.issues)
  
  return { result, fixed }
}