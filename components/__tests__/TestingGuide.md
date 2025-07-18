# Testing Guide for Table Data Optimization

## Overview

This document provides guidance on testing the table data optimization components and features. The comprehensive test suite includes integration tests, end-to-end tests, visual regression tests, and documentation.

## Test Structure

### 1. Integration Tests (`UserWorkflows.integration.test.ts`)

Tests complete user workflows including:
- **View Workflow**: Opening detail modals and viewing item information
- **Edit Workflow**: Editing items through modals and forms
- **Delete Workflow**: Deleting items with confirmation dialogs
- **Search and Filter Workflow**: Searching across all fields and applying filters
- **Responsive Workflow**: Testing mobile, tablet, and desktop interactions
- **Error Handling Workflow**: Graceful handling of errors and edge cases
- **Loading States Workflow**: Testing loading states and transitions

### 2. Cross-Page Consistency Tests (`CrossPageConsistency.e2e.test.ts`)

Ensures consistent behavior across different data types:
- **Column Configuration Consistency**: Verifies column priorities and structure
- **Component Behavior Consistency**: Tests rendering and actions across data types
- **Responsive Behavior Consistency**: Ensures consistent responsive behavior
- **Error Handling Consistency**: Consistent error handling across pages
- **Data Type Specific Consistency**: Appropriate columns for each data type
- **Performance Consistency**: Consistent performance across data types

### 3. Visual Regression Tests (`VisualRegression.test.ts`)

Tests visual consistency and responsive layouts:
- **OptimizedDataTable Responsive Layout**: Tests across different viewports
- **DetailModal Responsive Layout**: Modal behavior on different screen sizes
- **QuickActionButtons Responsive Layout**: Action button adaptations
- **Layout Consistency**: Visual hierarchy maintenance
- **Performance Visual Regression**: Smooth transitions and accessibility

## Running Tests

### Prerequisites

Before running the comprehensive tests, ensure the following setup:

1. **PrimeVue Configuration**: Tests require PrimeVue components to be properly configured
2. **Mock Services**: Toast service and other dependencies should be mocked
3. **Test Data**: Appropriate test data for different data types

### Test Commands

```bash
# Run all tests
npm run test

# Run specific test files
npm run test -- --run components/__tests__/UserWorkflows.integration.test.ts
npm run test -- --run components/__tests__/CrossPageConsistency.e2e.test.ts
npm run test -- --run components/__tests__/VisualRegression.test.ts

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch
```

### Test Environment Setup

For the tests to run properly, you may need to configure the test environment:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'], // Add setup file
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
    },
  },
})
```

```typescript
// test/setup.ts
import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

// Configure Vue Test Utils
config.global.plugins = [PrimeVue]

// Mock PrimeVue services
vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: vi.fn(),
    close: vi.fn()
  })
}))

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  })
}))
```

## Test Categories

### Unit Tests
- Component rendering
- Props validation
- Event emission
- Method functionality
- Computed properties

### Integration Tests
- Component interactions
- Data flow
- User workflows
- Modal integrations
- Form submissions

### End-to-End Tests
- Cross-page consistency
- Navigation flows
- Data persistence
- Error scenarios
- Performance metrics

### Visual Regression Tests
- Layout consistency
- Responsive behavior
- Theme compatibility
- Accessibility compliance

## Test Data

### Mock Data Structure

```typescript
// Common Actions Test Data
const mockCommonActions = [
  {
    id: 1,
    name: 'Aim',
    type: 'Simple',
    attribute: 'Agility',
    skill: 'Firearms',
    description: 'Take careful aim at your target',
    source: 'Core Rulebook',
    page: 162,
    homebrew: false
  }
]

// Edge Actions Test Data
const mockEdgeActions = [
  {
    id: 1,
    name: 'Push the Limit',
    edgeCost: 1,
    type: 'Free',
    restriction: 'Once per turn',
    description: 'Add Edge rating to a test',
    source: 'Core Rulebook',
    page: 56
  }
]
```

## Testing Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Management
- Mock external dependencies
- Use consistent mock data
- Clean up mocks between tests

### 3. Async Testing
- Use proper async/await patterns
- Wait for DOM updates with nextTick
- Handle loading states appropriately

### 4. Responsive Testing
- Test multiple viewport sizes
- Verify touch interactions
- Check accessibility at all breakpoints

### 5. Error Testing
- Test error boundaries
- Verify error messages
- Test recovery scenarios

## Common Issues and Solutions

### Issue: PrimeVue Components Not Found
**Solution**: Ensure PrimeVue is properly configured in test setup

### Issue: Mock Services Not Working
**Solution**: Verify mock imports and implementations

### Issue: Async Tests Failing
**Solution**: Use proper async patterns and wait for DOM updates

### Issue: Responsive Tests Inconsistent
**Solution**: Mock window dimensions and trigger resize events

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage for component logic
- **Integration Tests**: Cover all major user workflows
- **E2E Tests**: Test cross-page consistency
- **Visual Tests**: Cover all responsive breakpoints

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test -- --coverage
      - run: npm run test:e2e
```

## Performance Testing

### Metrics to Monitor
- Component render time
- Table loading performance
- Modal opening speed
- Search response time
- Memory usage

### Performance Thresholds
- Initial render: < 100ms
- Search response: < 300ms
- Modal opening: < 200ms
- Large dataset handling: < 500ms

## Accessibility Testing

### Key Areas
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast
- ARIA labels

### Testing Tools
- axe-core for automated testing
- Manual keyboard testing
- Screen reader testing
- Color contrast analyzers

## Documentation Testing

### Areas Covered
- Component API documentation
- Usage examples
- Migration guides
- Best practices
- Troubleshooting guides

### Validation
- Code examples work correctly
- Documentation matches implementation
- Examples are up to date
- Links are functional

## Maintenance

### Regular Tasks
- Update test data as features change
- Review and update mock implementations
- Maintain test environment configuration
- Update documentation examples

### When to Update Tests
- New features added
- Bug fixes implemented
- API changes made
- Performance optimizations
- Accessibility improvements

This comprehensive testing approach ensures the table data optimization feature is robust, reliable, and maintains high quality across all use cases and environments.