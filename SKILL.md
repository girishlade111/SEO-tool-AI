# SKILL: Lade Stack AI SEO Copilot — Enterprise SaaS Build

## Role
You are an elite team of Principal Software Architects, Staff Full Stack Engineers, AI Engineers, Platform Engineers, DevOps Engineers, SREs, Security Engineers, UX Engineers, Database Architects, QA Architects, and Product Engineers responsible for building the complete production-ready Lade Stack AI SEO Copilot SaaS platform.

## Source Documents
- `PRD.md` — Product requirements, features, personas, success metrics
- `DESIGN.md` — System architecture, database design, API design, folder structure

## Architecture Constraints

### Always use:
- **Repository Pattern** — Prisma access is NEVER outside repositories
- **Service Layer** — Business logic is NEVER in route handlers
- **Dependency Injection** — Services receive repositories via constructor
- **Composition over inheritance**
- **SOLID principles**
- **Clean Architecture** — Layer separation is strict
- **Feature-first** — Code organized by feature, not by type

### Folder Structure
```
packages/
  shared/      — Types, validators, constants, permissions, errors, utils
  database/    — Prisma schema, migrations, repositories, client
  services/    — Business logic, AI orchestration, jobs, cache, notifications
  ai-core/     — Provider routing, streaming, token tracking, cost calculation
  config/      — Environment, logging, errors, rate limiting, security
apps/
  web/         — Next.js frontend, API routes, components, hooks, pages
workers/       — Background job processors (Docker-based)
```

### Database Rules
- Use Prisma with PostgreSQL
- All models have: id, createdAt, updatedAt, deletedAt (soft delete)
- All queries go through repositories
- No raw SQL unless absolutely necessary (document why)

### API Rules
- Prefix: `/api/v1/`
- Standard response format: `{ status, data, error?, meta? }`
- Async operations return 202 with job ID
- Always validate with Zod before processing
- Always authorize (RBAC) before mutation operations
- Always rate limit
- Always audit log mutations and sensitive reads

### UI Rules
- shadcn/ui for all primitives
- Tailwind CSS v4 for styling
- TanStack Query for server state
- Zustand for client state (only what can't be server-managed)
- React Hook Form + Zod for forms
- Dark mode by default with toggle
- Responsive (mobile-first)
- WCAG 2.2 AA accessible
- Error boundaries on every route
- Loading states (skeleton) everywhere
- Empty states everywhere

### Coding Rules
- Strict TypeScript everywhere
- No `any` — use `unknown` and guard
- No `// TODO` comments — implement fully or explain why not
- No placeholder implementations
- No dead code paths
- No unnecessary dependencies
- Every exported function/type has JSDoc
- Components are pure unless they manage state
- Server components by default, client only when needed (`use client`)

### Security Rules
- Input validation (Zod) on every API endpoint
- CSRF protection via Next.js built-in
- Rate limiting on every endpoint
- Prompt injection protection in all AI operations
- Audit logging for all state changes
- Secrets never committed (always use env vars)
- RBAC enforced at both API and UI level
- XSS protection via output encoding
- SQL injection prevention via Prisma parameterization

### AI Rules
- Multi-provider architecture (OpenAI, Anthropic, Google)
- Provider routing with fallback
- Streaming for all chat responses
- Token tracking and cost accounting
- Prompt templates with versioning
- Context building (project + page + analysis context for AI)
- Prompt injection detection
- Rate limiting per model per user

## Implementation Order
1. Initialize project (Turborepo + Next.js + shared packages)
2. Database schema (Prisma) + client + repositories
3. Shared types, validators, constants
4. Configuration package (env, logger, errors, rate limiter)
5. Auth service + NextAuth setup
6. API foundation (route handlers, middleware)
7. Frontend layout + providers
8. Feature: Projects (CRUD, members)
9. Feature: Analysis (crawl, audit, score, issues)
10. Feature: Keywords (research, cluster, track)
11. Feature: Content (CRUD, versions, optimize)
12. Feature: AI (chat copilot, generation, analysis)
13. Feature: Reports (generate, schedule, export)
14. Feature: Billing (subscriptions, usage, invoices)
15. Feature: Admin (users, flags, audit logs)
16. Feature: Notifications (in-app, email)
17. Background workers for heavy operations
18. Testing (unit, integration, e2e)
19. CI/CD pipeline
20. Infrastructure as Code

## Verification
- After each feature: lint, typecheck, test
- Before deployment: full test suite, security audit, accessibility audit
- Production: monitor errors, performance, usage patterns
