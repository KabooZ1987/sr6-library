# Shadowrun 6th Edition (SR6) Library

A comprehensive reference application and digital library for Shadowrun 6th Edition rules, actions, and homebrew content. Built with a focus on accessibility, performance, and responsive design.

## 🚀 Overview

This project serves as a centralized database for SR6 players and game masters, providing quick access to:
- **Common Actions**: Combat and non-combat actions.
- **Edge Boosts**: Standard uses for Edge during tests.
- **Edge Actions**: Special actions that require Edge points.
- **Rules**: Core and supplemental rules for various game mechanics.
- **Homebrew**: Custom content and house rules.

## 🛠 Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) (Vue.js 3)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [PrimeVue](https://primevue.org/)
- **Package Manager**: [Bun](https://bun.sh/) (recommended) or Node.js
- **Testing**: [Vitest](https://vitest.dev/) (Unit/Integration/A11y/Perf) & [Playwright](https://playwright.dev/) (E2E)

## 📋 Requirements

- **Bun** (>= 1.0) or **Node.js** (>= 18.0)
- **PostgreSQL** instance
- **Prisma CLI** (installed via dependencies)

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sr6-library
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/webdb?schema=public"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma db push
   ```

## 🚀 Running the Application

### Development Server
Start the development server with Hot Module Replacement (HMR):
```bash
bun run dev
# or
npm run dev
```
The application will be available at `http://localhost:3010`.

### Production Build
Build the application for production:
```bash
bun run build
# or
npm run build
```

Preview the production build locally:
```bash
bun run preview
# or
npm run preview
```

## 📜 Scripts

| Script | Description |
| :--- | :--- |
| `dev` | Starts the development server at port 3010 |
| `build` | Builds the application for production |
| `generate` | Static site generation (SSG) |
| `preview` | Previews the production build locally |
| `postinstall` | Runs `nuxt prepare` for type generation |
| `test` | Runs all Vitest suites in watch mode |
| `test:run` | Runs all Vitest suites once |
| `test:unit` | Runs unit tests with verbose reporting |
| `test:integration` | Runs integration tests using `vitest.integration.config.ts` |
| `test:e2e` | Runs Playwright end-to-end tests |
| `test:accessibility` | Runs accessibility tests using `vitest.accessibility.config.ts` |
| `test:performance` | Runs performance benchmarking tests |
| `test:all` | Sequentially runs all test suites (Unit, Integration, A11y, Perf, E2E) |

## 🧪 Testing Strategy

The project features a comprehensive test suite ensuring high quality and accessibility:
- **Unit Tests**: Component and composable logic validation.
- **Integration Tests**: Workflow and cross-component state management.
- **Accessibility (A11y)**: WCAG 2.1 AA compliance validation using `axe-core`.
- **Performance**: Interaction responsiveness and rendering benchmarks.
- **End-to-End (E2E)**: Critical user path validation across browsers.

For detailed information, refer to [docs/TestSuite.md](./docs/TestSuite.md).

## 📂 Project Structure

```text
sr6-library/
├── components/          # Reusable Vue components
│   ├── Table/           # Data table specific components
│   └── __tests__/       # Component unit tests
├── pages/               # Nuxt pages (routing)
├── server/              # Nitro server engine (API routes)
│   └── api/             # CRUD endpoints for library data
├── prisma/              # Database schema and migrations
├── composables/         # Shared state and logic
├── assets/              # Static assets and global styles
├── tests/               # E2E and shared test configurations
├── docs/                # Project documentation
└── public/              # Static files (images, icons, etc.)
```

## 🔐 Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (Required for Prisma).
- `PORT`: (Optional) Port to run the server on (Default: 3010).

## 📝 TODOs

- [ ] Implement Authentication and Authorization for administrative tasks.
- [ ] Add deployment documentation and CI/CD pipelines.
- [ ] Expand homebrew features (e.g., sharing/exporting).
- [ ] Add more comprehensive seeding for core rules.
- [ ] Define project license.

## 📄 License

TODO: Add license information.
