### Development Guidelines for sr6-library

This document provides project-specific information for developers working on the `sr6-library` project.

---

### 1. Build and Configuration

#### Prerequisites
- Node.js (Version compatible with Nuxt 3)
- PostgreSQL (Database)

#### Setup Instructions
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
    Alternatively, you can use `bun install` as the project includes a `bun.lock` file.

2.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
    This step is required after installing dependencies or whenever the `prisma/schema.prisma` file is modified.

3.  **Database Configuration**:
    The database connection is configured in `prisma/schema.prisma`. Ensure your PostgreSQL instance is accessible.

4.  **Running Development Server**:
    ```bash
    npm run dev
    ```
    The server will start at `http://0.0.0.0:3010` by default (as configured in `nuxt.config.ts`).

---

### 2. Testing Information

The project uses **Vitest** for unit, integration, accessibility, and performance testing, and **Playwright** for end-to-end (E2E) testing.

#### Running Tests
-   **Unit Tests**: `npm run test:unit`
-   **Integration Tests**: `npm run test:integration`
-   **E2E Tests**: `npm run test:e2e`
-   **Accessibility Tests**: `npm run test:accessibility`
-   **Performance Tests**: `npm run test:performance`
-   **Run All Tests**: `npm run test:all`

#### Adding New Tests
-   **Unit/Integration Tests**: Create a file ending in `.test.ts` in the `tests` directory or a `__tests__` subdirectory.
-   **E2E Tests**: Create a file ending in `.spec.ts` in the `tests/e2e` directory.

#### Example Test
To run a simple Vitest test, create a file (e.g., `tests/example.test.ts`):
```typescript
import { describe, it, expect } from 'vitest'

describe('Math operations', () => {
  it('should add two numbers correctly', () => {
    expect(1 + 1).toBe(2)
  })
})
```
Run it with:
```bash
npx vitest run tests/example.test.ts
```

---

### 3. Additional Development Information

#### Code Style and Patterns
-   **Vue 3 Composition API**: Always use `<script setup lang="ts">` for components.
-   **TypeScript**: Use TypeScript for all new code. Define interfaces for props and emits.
-   **Component Library**: Use **PrimeVue** components for UI elements.
-   **Styling**: Use **Tailwind CSS** and SCSS.
-   **Composables**: Extract reusable logic into composables located in the `composables/` directory.
-   **Project Structure**:
    -   `server/api/`: Nitro API routes.
    -   `prisma/`: Database schema and migrations.
    -   `types/`: Global TypeScript type definitions.
    -   `data/`: Static data and JSON files.

#### Best Practices
-   Ensure all new components are accessible (check with `npm run test:accessibility`).
-   Keep components focused and modular.
-   Update `prisma/schema.prisma` when changing the data model and run `npx prisma generate`.
