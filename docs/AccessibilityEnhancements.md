# Accessibility Enhancements Documentation

This document outlines the comprehensive accessibility enhancements implemented across all interactive elements in the Shadowrun 6th Edition reference application.

## Overview

The accessibility enhancements ensure that all interactive elements (buttons, links, forms, and navigation) meet WCAG 2.1 AA standards and provide an inclusive experience for users with disabilities.

## Key Features Implemented

### 1. Screen Reader Support

#### Live Region Announcements
- Automatic creation of ARIA live regions for state change announcements
- Configurable announcement priorities (polite/assertive)
- Context-aware state change notifications

#### Enhanced ARIA Labels
- Dynamic ARIA label generation based on element state
- Contextual descriptions for complex interactions
- Proper role and property assignments

### 2. Keyboard Navigation

#### Comprehensive Keyboard Support
- Enter and Space key activation for all interactive elements
- Arrow key navigation for grouped elements (dropdowns, menus)
- Escape key handling for modal dismissal
- Tab key management with proper focus trapping

#### Focus Management
- Automatic focus restoration after modal interactions
- Focus trapping within containers (dropdowns, dialogs)
- Visible focus indicators with high contrast support
- Skip navigation links for efficient page traversal

### 3. Visual Accessibility

#### High Contrast Mode Support
- Automatic detection of user's high contrast preference
- Enhanced visual indicators and borders
- Improved color contrast ratios
- Alternative styling for better visibility

#### Reduced Motion Support
- Detection of user's reduced motion preference
- Disabled animations and transitions when preferred
- Static alternatives for animated feedback
- Respect for vestibular disorder considerations

#### Color Contrast Compliance
- Automated color contrast checking utilities
- WCAG AA/AAA compliance verification
- Automatic contrast adjustment when needed
- Support for both light and dark themes

### 4. Touch and Mobile Accessibility

#### Touch-Friendly Interactions
- Minimum 44px touch targets on mobile devices
- Enhanced touch feedback and visual responses
- Improved spacing between interactive elements
- Gesture-friendly navigation patterns

#### Responsive Accessibility
- Adaptive layouts that maintain accessibility across screen sizes
- Mobile-optimized dropdown and menu interactions
- Touch-specific ARIA attributes and behaviors

## Component-Specific Enhancements

### BaseButton Component

```vue
<BaseButton
  aria-label="Save document"
  aria-describedby="save-help"
  touch-friendly
  :button-state-options="{ announceStateChanges: true }"
>
  Save
</BaseButton>
```

**Features:**
- Dynamic ARIA labels with state information
- Screen reader announcements for loading/error/success states
- Keyboard navigation with Enter/Space support
- High contrast and reduced motion support
- Touch-friendly sizing options

### AppLink Component

```vue
<AppLink
  to="/internal-page"
  aria-label="Navigate to settings"
>
  Settings
</AppLink>
```

**Features:**
- Automatic internal/external link detection
- Proper target and rel attributes for external links
- Keyboard navigation support
- Visual indicators for external links
- Disabled state handling with proper ARIA attributes

### ActionButton Component

```vue
<ActionButton
  action="delete"
  item-name="User Document"
  item-type="document"
  require-confirmation
  aria-describedby="delete-help"
/>
```

**Features:**
- Contextual ARIA labels with action and item information
- Confirmation dialog accessibility
- State change announcements with context
- Action-specific styling and feedback

### NavigationLink Component

```vue
<NavigationLink
  to="/current-section"
  has-children
  :is-expanded="menuExpanded"
  breadcrumb-label="Main Navigation"
>
  Navigation Item
</NavigationLink>
```

**Features:**
- Active state detection and announcement
- Nested navigation support with proper ARIA attributes
- Breadcrumb navigation accessibility
- Expansion state management and announcements

### QuickActionButtons Component

```vue
<QuickActionButtons
  :item="{ id: 1, name: 'Document Title' }"
  async-actions
  @view="handleView"
  @edit="handleEdit"
  @delete="handleDelete"
/>
```

**Features:**
- Responsive layout with accessibility maintained across screen sizes
- Dropdown menu with keyboard navigation
- Focus management within dropdown
- Loading state announcements for async actions
- Touch-friendly mobile interactions

## Accessibility Composables

### useAccessibility

The core accessibility composable provides:

```typescript
const {
  announceToScreenReader,
  announceStateChange,
  manageFocus,
  trapFocus,
  restoreFocus,
  handleKeyboardNavigation,
  prefersReducedMotion,
  prefersHighContrast,
  generateAriaLabel,
  checkColorContrast
} = useAccessibility({
  announceStateChanges: true,
  respectReducedMotion: true,
  enableKeyboardNavigation: true,
  enableFocusManagement: true,
  enableHighContrast: true
})
```

### useAccessibilityHelpers

Convenience functions for common accessibility patterns:

```typescript
const {
  enhanceButtonAccessibility,
  enhanceLinkAccessibility,
  enhanceFormAccessibility
} = useAccessibilityHelpers()
```

## Accessibility Audit Utility

### Automated Accessibility Checking

```typescript
import { auditAccessibility, autoFixAccessibility } from '~/utils/accessibilityAudit'

// Perform accessibility audit
const result = await auditAccessibility(document.body, {
  includeWarnings: true,
  checkColorContrast: true,
  checkKeyboardNavigation: true
})

// Auto-fix common issues
const { result, fixed } = await autoFixAccessibility(document.body)
```

**Audit Features:**
- ARIA label and attribute validation
- Keyboard navigation compliance checking
- Color contrast ratio verification
- Document structure validation
- Focus management assessment
- Automated issue scoring and reporting

### Audit Categories

1. **ARIA Issues**: Missing labels, incorrect attributes, improper roles
2. **Keyboard Issues**: Inaccessible interactive elements, improper tab order
3. **Color Issues**: Insufficient contrast ratios, color-only indicators
4. **Focus Issues**: Missing focus indicators, improper focus management
5. **Structure Issues**: Missing landmarks, improper heading hierarchy
6. **Content Issues**: Missing alt text, unclear link purposes

## Testing Strategy

### Automated Testing

- Unit tests for all accessibility composables
- Component tests for ARIA attributes and keyboard interactions
- Integration tests for complete user workflows
- Accessibility audit tests for compliance verification

### Manual Testing Checklist

1. **Screen Reader Testing**
   - Test with NVDA, JAWS, or VoiceOver
   - Verify all content is announced correctly
   - Check navigation efficiency

2. **Keyboard Navigation Testing**
   - Navigate entire application using only keyboard
   - Verify all interactive elements are reachable
   - Test focus indicators and tab order

3. **High Contrast Testing**
   - Enable high contrast mode in OS
   - Verify all content remains visible and usable
   - Check focus indicators are clearly visible

4. **Reduced Motion Testing**
   - Enable reduced motion preference
   - Verify animations are disabled or reduced
   - Check that functionality remains intact

5. **Mobile Accessibility Testing**
   - Test touch targets meet minimum size requirements
   - Verify screen reader functionality on mobile
   - Check gesture-based interactions

## Browser Support

### Target Browsers
- Chrome 90+ (including mobile)
- Firefox 88+ (including mobile)
- Safari 14+ (including iOS)
- Edge 90+

### Accessibility APIs
- ARIA 1.2 specification compliance
- Platform accessibility API integration
- Screen reader compatibility across platforms

## Performance Considerations

### Optimization Strategies
- Lazy loading of accessibility utilities
- Efficient event listener management
- Minimal DOM manipulation for ARIA updates
- Debounced state change announcements

### Memory Management
- Automatic cleanup of event listeners
- Proper disposal of live regions
- Efficient focus management without memory leaks

## Best Practices

### Development Guidelines

1. **Always provide accessible names** for interactive elements
2. **Use semantic HTML** before adding ARIA attributes
3. **Test with keyboard navigation** during development
4. **Verify color contrast** meets WCAG standards
5. **Announce important state changes** to screen readers
6. **Provide clear focus indicators** for all interactive elements
7. **Support user preferences** for motion and contrast
8. **Test with actual assistive technologies** regularly

### Code Examples

#### Accessible Button Pattern
```vue
<template>
  <BaseButton
    :aria-label="computedAriaLabel"
    :aria-describedby="helpTextId"
    :disabled="isProcessing"
    @click="handleAction"
  >
    {{ buttonText }}
  </BaseButton>
</template>

<script setup>
const computedAriaLabel = computed(() => {
  let label = baseLabel
  if (isProcessing) label += ', loading'
  if (hasError) label += ', error occurred'
  return label
})
</script>
```

#### Accessible Form Pattern
```vue
<template>
  <div class="form-field">
    <label :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      :aria-describedby="hasError ? errorId : helpId"
      :aria-invalid="hasError"
      v-model="value"
    />
    <div :id="helpId" class="help-text">{{ helpText }}</div>
    <div v-if="hasError" :id="errorId" role="alert">{{ errorMessage }}</div>
  </div>
</template>
```

## Future Enhancements

### Planned Improvements
- Voice control support
- Advanced gesture recognition
- AI-powered accessibility suggestions
- Real-time accessibility monitoring
- Enhanced mobile screen reader support

### Emerging Standards
- ARIA 1.3 specification adoption
- Web Content Accessibility Guidelines 2.2 compliance
- European Accessibility Act compliance
- Section 508 refresh compliance

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

### Testing Tools
- [axe-core](https://github.com/dequelabs/axe-core) - Automated accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Accessibility auditing

### Screen Readers
- [NVDA](https://www.nvaccess.org/) - Free Windows screen reader
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Popular Windows screen reader
- [VoiceOver](https://www.apple.com/accessibility/mac/vision/) - Built-in macOS/iOS screen reader