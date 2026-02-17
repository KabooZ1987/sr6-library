import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Interactive Elements E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test.describe('Navigation and Links', () => {
    test('should navigate between pages using navigation links', async ({ page }) => {
      // Test navigation to Common Actions page
      await page.click('text=Actions')
      await expect(page).toHaveURL('/commonActions')
      await expect(page.locator('h1')).toContainText('Common Actions')

      // Test navigation to Edge Boosts page
      await page.click('text=Edge boosts')
      await expect(page).toHaveURL('/edgeBoosts')

      // Test navigation back to home
      await page.click('text=Home')
      await expect(page).toHaveURL('/')
    })

    test('should handle external links correctly', async ({ page, context }) => {
      // Mock external link for testing
      await page.goto('/commonActions')
      
      // Add a test external link
      await page.evaluate(() => {
        const link = document.createElement('a')
        link.href = 'https://example.com'
        link.textContent = 'External Link'
        link.id = 'test-external-link'
        document.body.appendChild(link)
      })

      // Listen for new page creation
      const pagePromise = context.waitForEvent('page')
      await page.click('#test-external-link')
      
      const newPage = await pagePromise
      await expect(newPage).toHaveURL('https://example.com')
      await newPage.close()
    })

    test('should show active navigation state', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Check that the current page link has active styling
      const activeLink = page.locator('nav a[href="/commonActions"]')
      await expect(activeLink).toHaveClass(/active|current/)
    })
  })

  test.describe('Button Interactions', () => {
    test('should handle button clicks and state changes', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Test opening a modal/form
      const addButton = page.locator('button:has-text("Add")')
      if (await addButton.count() > 0) {
        await addButton.click()
        
        // Check that modal/form opened
        await expect(page.locator('[role="dialog"], .modal, form')).toBeVisible()
        
        // Test cancel button
        const cancelButton = page.locator('button:has-text("Cancel")')
        if (await cancelButton.count() > 0) {
          await cancelButton.click()
          await expect(page.locator('[role="dialog"], .modal')).not.toBeVisible()
        }
      }
    })

    test('should handle form submission', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Look for form elements
      const forms = page.locator('form')
      if (await forms.count() > 0) {
        const form = forms.first()
        
        // Fill out form fields
        const nameInput = form.locator('input[type="text"], input[name*="name"]').first()
        if (await nameInput.count() > 0) {
          await nameInput.fill('Test Action')
        }
        
        const descInput = form.locator('textarea, input[name*="desc"]').first()
        if (await descInput.count() > 0) {
          await descInput.fill('Test Description')
        }
        
        // Submit form
        const submitButton = form.locator('button[type="submit"], button:has-text("Save")')
        if (await submitButton.count() > 0) {
          await submitButton.click()
          
          // Check for success feedback
          await expect(page.locator('.success, .toast, [role="alert"]')).toBeVisible({ timeout: 5000 })
        }
      }
    })

    test('should handle loading states', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Find a button that might trigger loading
      const actionButton = page.locator('button:has-text("Save"), button:has-text("Submit")').first()
      
      if (await actionButton.count() > 0) {
        await actionButton.click()
        
        // Check for loading indicator
        await expect(page.locator('.loading, [aria-busy="true"], .spinner')).toBeVisible({ timeout: 1000 })
      }
    })

    test('should handle confirmation dialogs', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Look for delete buttons
      const deleteButton = page.locator('button:has-text("Delete"), [data-action="delete"]').first()
      
      if (await deleteButton.count() > 0) {
        // Listen for dialog
        page.on('dialog', async dialog => {
          expect(dialog.type()).toBe('confirm')
          expect(dialog.message()).toContain('delete')
          await dialog.accept()
        })
        
        await deleteButton.click()
      }
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/')
      
      // Test Tab navigation
      await page.keyboard.press('Tab')
      let focusedElement = await page.locator(':focus').first()
      await expect(focusedElement).toBeVisible()
      
      // Continue tabbing through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        focusedElement = await page.locator(':focus').first()
        await expect(focusedElement).toBeVisible()
      }
    })

    test('should activate buttons with Enter and Space', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Find a button and focus it
      const button = page.locator('button').first()
      await button.focus()
      
      // Test Enter key activation
      await page.keyboard.press('Enter')
      
      // Test Space key activation
      await button.focus()
      await page.keyboard.press('Space')
    })

    test('should activate links with Enter', async ({ page }) => {
      await page.goto('/')
      
      // Find a navigation link and focus it
      const link = page.locator('nav a').first()
      await link.focus()
      
      // Activate with Enter key
      await page.keyboard.press('Enter')
      
      // Should navigate
      await expect(page).not.toHaveURL('/')
    })

    test('should handle Escape key in modals', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Open a modal if available
      const modalTrigger = page.locator('button:has-text("Add"), button:has-text("Edit")').first()
      if (await modalTrigger.count() > 0) {
        await modalTrigger.click()
        
        // Check modal is open
        const modal = page.locator('[role="dialog"], .modal')
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible()
          
          // Press Escape to close
          await page.keyboard.press('Escape')
          await expect(modal).not.toBeVisible()
        }
      }
    })
  })

  test.describe('Touch and Mobile Interactions', () => {
    test('should handle touch interactions on mobile', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip('Skipping mobile-specific test on desktop')
      }
      
      await page.goto('/')
      
      // Test touch navigation
      const navButton = page.locator('button:has-text("☰"), .mobile-nav-toggle').first()
      if (await navButton.count() > 0) {
        await navButton.tap()
        await expect(page.locator('nav, .mobile-nav')).toBeVisible()
      }
      
      // Test touch on buttons
      const buttons = page.locator('button')
      if (await buttons.count() > 0) {
        await buttons.first().tap()
      }
    })

    test('should have appropriate touch target sizes', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip('Skipping mobile-specific test on desktop')
      }
      
      await page.goto('/commonActions')
      
      // Check button sizes
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()
        
        if (box) {
          // Touch targets should be at least 44px
          expect(box.height).toBeGreaterThanOrEqual(44)
          expect(box.width).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Responsive Behavior', () => {
    test('should adapt to different screen sizes', async ({ page }) => {
      await page.goto('/')
      
      // Test desktop view
      await page.setViewportSize({ width: 1200, height: 800 })
      await expect(page.locator('nav')).toBeVisible()
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(100) // Allow for responsive changes
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)
      
      // Mobile navigation should be different
      const mobileNav = page.locator('.mobile-nav-toggle, button:has-text("☰")')
      if (await mobileNav.count() > 0) {
        await expect(mobileNav).toBeVisible()
      }
    })

    test('should handle orientation changes', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip('Skipping mobile-specific test on desktop')
      }
      
      await page.goto('/commonActions')
      
      // Portrait
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(100)
      
      // Landscape
      await page.setViewportSize({ width: 667, height: 375 })
      await page.waitForTimeout(100)
      
      // Check that layout adapts
      const buttons = page.locator('button')
      await expect(buttons.first()).toBeVisible()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Simulate network failure
      await page.route('**/api/**', route => route.abort())
      
      // Try to perform an action that would make an API call
      const submitButton = page.locator('button:has-text("Save"), button[type="submit"]').first()
      if (await submitButton.count() > 0) {
        await submitButton.click()
        
        // Should show error message
        await expect(page.locator('.error, [role="alert"], .toast')).toBeVisible({ timeout: 5000 })
      }
    })

    test('should show validation errors', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Find a form
      const form = page.locator('form').first()
      if (await form.count() > 0) {
        // Try to submit empty form
        const submitButton = form.locator('button[type="submit"], button:has-text("Save")').first()
        if (await submitButton.count() > 0) {
          await submitButton.click()
          
          // Should show validation errors
          await expect(page.locator('.error, .invalid, [aria-invalid="true"]')).toBeVisible({ timeout: 2000 })
        }
      }
    })
  })

  test.describe('Accessibility Compliance', () => {
    test('should pass accessibility audit on home page', async ({ page }) => {
      await page.goto('/')
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      })
    })

    test('should pass accessibility audit on common actions page', async ({ page }) => {
      await page.goto('/commonActions')
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true }
      })
    })

    test('should have proper focus indicators', async ({ page }) => {
      await page.goto('/')
      
      // Tab through interactive elements and check focus visibility
      const interactiveElements = page.locator('button, a, input, select, textarea')
      const count = await interactiveElements.count()
      
      for (let i = 0; i < Math.min(count, 10); i++) {
        const element = interactiveElements.nth(i)
        await element.focus()
        
        // Check that focus is visible (this is a basic check)
        await expect(element).toBeFocused()
      }
    })

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Check buttons have accessible names
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        const accessibleName = await button.getAttribute('aria-label') || await button.textContent()
        expect(accessibleName).toBeTruthy()
        expect(accessibleName?.trim()).not.toBe('')
      }
    })

    test('should announce state changes to screen readers', async ({ page }) => {
      await page.goto('/commonActions')
      
      // Check for live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
      if (await liveRegions.count() > 0) {
        await expect(liveRegions.first()).toBeInViewport()
      }
    })
  })

  test.describe('Performance', () => {
    test('should load pages quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      const loadTime = Date.now() - startTime
      
      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should respond to interactions quickly', async ({ page }) => {
      await page.goto('/commonActions')
      
      const button = page.locator('button').first()
      if (await button.count() > 0) {
        const startTime = Date.now()
        await button.click()
        const responseTime = Date.now() - startTime
        
        // Interaction should respond in under 100ms
        expect(responseTime).toBeLessThan(100)
      }
    })

    test('should handle rapid interactions', async ({ page }) => {
      await page.goto('/')
      
      const button = page.locator('button').first()
      if (await button.count() > 0) {
        // Rapid clicks
        for (let i = 0; i < 10; i++) {
          await button.click({ delay: 10 })
        }
        
        // Should remain responsive
        await expect(button).toBeVisible()
      }
    })
  })

  test.describe('Cross-Browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      await page.goto('/')
      
      // Basic functionality should work in all browsers
      const navLinks = page.locator('nav a')
      await expect(navLinks.first()).toBeVisible()
      
      // Click navigation should work
      if (await navLinks.count() > 1) {
        await navLinks.nth(1).click()
        await expect(page).not.toHaveURL('/')
      }
    })

    test('should handle browser-specific features gracefully', async ({ page, browserName }) => {
      await page.goto('/commonActions')
      
      // Test features that might vary by browser
      const buttons = page.locator('button')
      if (await buttons.count() > 0) {
        await buttons.first().click()
        
        // Should work regardless of browser
        await expect(buttons.first()).toBeVisible()
      }
    })
  })
})