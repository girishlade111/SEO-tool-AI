# Lade Stack AI SEO Copilot

Enterprise-grade, AI-powered SEO platform that automates technical audits, keyword research, content optimization, rank tracking, and competitive intelligence — all in one integrated SaaS.

**Vision:** Empower every organization to dominate search visibility through autonomous AI-powered SEO operations.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Project Management** | Multi-project CRUD, domain tracking, team RBAC |
| **Technical SEO Audit** | Automated crawling, page analysis, issue detection (meta, headings, images, links, performance, structured data, accessibility), Core Web Vitals, trend tracking |
| **Keyword Research** | Discovery, volume/difficulty/CPC data, clustering, search intent classification, SERP feature analysis, competitor gap analysis |
| **Content Analysis** | E-E-A-T scoring, readability (Flesch-Kincaid), TF-IDF, structure evaluation, internal linking, sentiment, freshness scoring |
| **Content Optimization** | Real-time editor with SEO scoring, keyword recommendations, headline/meta suggestions, schema markup, competitor comparison |
| **AI Content Generation** | Blog posts, meta tags, schema JSON-LD, landing pages, FAQs, product descriptions, content briefs; bulk generation; brand voice control |
| **AI Chat Copilot** | Conversational SEO assistant, multi-provider (OpenAI, Anthropic), streaming, conversation history, prompt templates, code generation |
| **Reports & Analytics** | Customizable PDF reports, white-label, scheduled auto-reports, executive dashboards, ranking trends, SEO score trends |
| **Competitor Intelligence** | Website monitoring, keyword gap analysis, backlink comparison, content strategy analysis, AI search visibility comparison |
| **AI Search Visibility (AEO/GEO)** | Track citations in ChatGPT, Claude, Perplexity, Gemini, Copilot; AI search share of voice |
| **Billing & Subscriptions** | Multiple tiers (Free, Pro, Business, Enterprise), usage-based metering, invoicing, credit system |
| **Admin Panel** | User/subscription management, feature flags, system config, audit logs, API key management |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Language** | TypeScript 5.7 (strict mode) |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Database** | PostgreSQL 16 + Prisma 6 ORM |
| **Auth** | NextAuth.js v5 (Credentials provider, JWT) |
| **UI** | Tailwind CSS v4, shadcn/ui, Radix primitives, lucide-react |
| **AI** | Multi-provider SDK (OpenAI, Anthropic, Perplexity) |
| **Queue** | In-memory JobQueue (BullMQ/Redis-ready) |
| **Cache** | Redis (Upstash / Vercel KV) |
| **Payments** | Stripe (subscriptions, invoices) |
| **Email** | Resend (transactional) |
| **Storage** | S3-compatible (AWS / Cloudflare R2) |
| **Forms** | React Hook Form + Zod |
| **Observability** | Sentry, OpenTelemetry, Logflare |

---

## Architecture

```
@lade/shared (zero deps)
    |
    +--- @lade/config (env, logger, errors, rate-limiter, security)
    |       |
    |       +--- @lade/database (Prisma client + repositories)
    |       |       |
    |       |       +--- @lade/services (business logic layer)
    |       |       |
    |       |       +--- @lade/ai-core (AI provider orchestration)
    |       |       |
    |       |       +--- apps/web (Next.js frontend + API routes)
    |       |       |
    |       |       +--- apps/workers (background job processor)
    |       |
    |       +--- @lade/ai-core
```

Clean Architecture with strict layer separation:
- **Presentation** — Next.js App Router (RSC + Client Components)
- **API** — Next.js Route Handlers (validation, auth, rate limiting)
- **Application** — Service layer (`@lade/services`)
- **Infrastructure** — Repositories, cache, queue, external services
- **Domain** — Shared types, validators, constants (`@lade/shared`)

---

## Project Structure

```
├── apps/
│   ├── web/              # Next.js 15 frontend + API routes
│   │   └── src/
│   │       ├── app/      # App Router pages
│   │       │   ├── (auth)/        # Login, Register
│   │       │   ├── (dashboard)/   # Overview, Projects, Analysis, Keywords, Content, Reports, Team, Billing, Settings
│   │       │   └── api/v1/        # REST API endpoints
│   │       ├── components/        # UI (shadcn/ui) + layout + feature components
│   │       └── lib/
│   │           ├── auth/          # NextAuth config
│   │           └── db/            # API-side db access
│   └── workers/          # Background job processor
│       └── src/
│           ├── handlers/  # Job handlers (analysis, report, notification, billing)
│           ├── queue.ts   # In-memory job queue
│           └── types.ts   # Job types
├── packages/
│   ├── shared/           # Zero-dependency shared code (types, validators, constants, permissions, errors, utils)
│   ├── database/         # Prisma schema, migrations, repositories
│   │   ├── prisma/schema/index.prisma  # 22 models, 30+ enums
│   │   └── src/repositories/           # 11 repository classes
│   ├── services/         # Business logic (auth, projects, analysis, keywords, content, reports, notifications, billing, admin, cache)
│   ├── ai-core/          # AI infrastructure (multi-provider, cost tracking, prompt management)
│   └── config/           # Shared config (env validation, logger, errors, rate limiter, security)
├── .env
├── PRD.md                # Product Requirements Document
├── DESIGN.md             # System Design Document
├── SKILL.md              # Development conventions
├── tsconfig.base.json    # Shared TypeScript config
├── turbo.json            # Turborepo pipeline
└── pnpm-workspace.yaml   # Workspace definition
```

---

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm ^9.15.0
- PostgreSQL 16

### Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed the database
pnpm db:seed

# Start development servers
#  - Web app at http://localhost:3000
#  - Workers run in background
pnpm dev
```

---

## Environment Variables

Copy `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Auth secret (min 32 chars) |
| `AUTH_SECRET` | Yes* | Alias for NEXTAUTH_SECRET (NextAuth v5) |
| `NEXTAUTH_URL` | No | Auto-detected in production |
| `OPENAI_API_KEY` | AI features | OpenAI API key |
| `ANTHROPIC_API_KEY` | AI features | Anthropic API key |
| `STRIPE_SECRET_KEY` | Billing | Stripe secret key |
| `RESEND_API_KEY` | Email | Resend API key |
| `KV_URL` | Caching | Redis connection URL |

---

## Available Scripts

### Root

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run all tests |
| `pnpm clean` | Clean all build artifacts |
| `pnpm format` | Format code with Prettier |

### Database

| Script | Purpose |
|--------|---------|
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Create/run development migrations |
| `pnpm db:migrate:prod` | Run production migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

---

## Database

PostgreSQL 16 with 22 models:

- **User & Auth** — User, Account, Session, VerificationToken
- **Projects** — Project, ProjectMember
- **SEO Analysis** — Page, Analysis, PageAnalysis, PageIssue
- **Keywords** — Keyword, KeywordCluster, KeywordRanking
- **Content** — Content, ContentVersion
- **Competitors** — Competitor
- **AI** — AiConversation, AiMessage, AiContentGeneration
- **Reports** — Report
- **Billing** — Subscription, UsageRecord, Invoice, PaymentMethod
- **System** — ApiKey, Notification, FeatureFlag, AuditLog

All models include `id` (cuid), `createdAt`, `updatedAt`, `deletedAt` (soft delete).

---

## Development Workflow

```bash
# Terminal 1: Run web + workers in parallel
pnpm dev

# Terminal 2: Type-check continuously (optional)
pnpm typecheck

# Before committing
pnpm typecheck && pnpm lint
```

### Type-check individual package

```bash
pnpm --filter @lade/web typecheck
pnpm --filter @lade/services typecheck
pnpm --filter @lade/database typecheck
```

---

## Deployment

### Web App

Deploys to Vercel. Configure environment variables in the Vercel dashboard.

### Workers

Runs as a standalone Node.js service (Docker-ready):

```bash
pnpm --filter @lade/workers start
```

---

## License

Private — All rights reserved.
