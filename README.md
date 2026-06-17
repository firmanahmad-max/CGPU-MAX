# CGPU-MAX

> Hardware Intelligence Platform — CPU & GPU comparison, bottleneck analysis, AI build advisor.

This is the monorepo for CGPU-MAX, built per [CGPU-MAX-MASTER-PROMPT.md](./CGPU-MAX-MASTER-PROMPT.md). Architecture follows Clean Architecture + DDD as described in [CGPU-MAX-ARCHITECTURE.md](./CGPU-MAX-ARCHITECTURE.md).

## Status

**Phase 1 — Foundation.** Monorepo scaffold, shared configs, API/Web app skeletons, Prisma schema, CI pipeline. No business features yet.

## Stack

- **Monorepo:** pnpm workspaces + Turborepo
- **Web:** Next.js 14 (App Router), TypeScript strict, Tailwind CSS
- **API:** Node 20, Express, TypeScript strict, Prisma, Zod, Pino
- **Data:** PostgreSQL 15, Redis 7
- **Quality:** ESLint, Prettier, Husky + lint-staged, Jest

## Project layout

```
.
├── apps/
│   ├── api/         # Express API (DDD modules)
│   └── web/         # Next.js 14 frontend
├── packages/
│   ├── config/      # Shared eslint + tsconfig presets
│   └── types/       # Shared domain TypeScript types
├── services/
│   └── scraper/     # Multi-source data collection (BullMQ worker)
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

Each API module follows the Master Prompt template: `domain/`, `application/`, `infrastructure/`, `interface/`, `tests/`.

## Getting started

### Prerequisites

- Node.js 20 (use `.nvmrc`)
- pnpm 9
- Docker Desktop (for Postgres + Redis)

### Run it locally — no accounts required

Auth (Clerk), billing (Stripe), and the AI advisor (Anthropic) are **optional**.
With no third-party keys set, the app boots in anonymous mode and the core
features — browse, compare, bottleneck, gaming, streaming — work end-to-end.
Auth-only surfaces (sign-in, account, Pro/Enterprise actions) degrade gracefully.

```bash
# 1. Install dependencies
pnpm install

# 2. Env: copy the template. The defaults already point at the docker-compose
#    Postgres/Redis, so you can run without editing anything.
cp .env.example .env.local

# 3. Start infrastructure
docker compose up -d postgres redis

# 4. Generate Prisma client, migrate, and seed demo data (6 CPUs + 7 GPUs
#    with benchmarks and price history)
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Start the API + web in watch mode
pnpm dev
```

- Web → http://localhost:3000 (try **/processors**, **/compare**, **/bottleneck**)
- API → http://localhost:3001
- Health → http://localhost:3001/health · Metrics → http://localhost:3001/metrics
- Sample → http://localhost:3001/api/v1/processors

To enable accounts/billing/AI later, fill the matching keys in `.env.local`
(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`, Stripe, `ANTHROPIC_API_KEY`)
and restart — the app picks them up automatically.

### Scripts

| Command           | What                               |
| ----------------- | ---------------------------------- |
| `pnpm dev`        | Run all apps in watch mode (Turbo) |
| `pnpm build`      | Build all apps                     |
| `pnpm lint`       | ESLint across workspace            |
| `pnpm type-check` | TypeScript no-emit check           |
| `pnpm test`       | Jest across workspace              |
| `pnpm format`     | Prettier write                     |
| `pnpm db:migrate` | Prisma migrate dev                 |
| `pnpm db:seed`    | Seed sample data                   |

### Scraper

The scraper service pulls processor data from Geekbench, TechPowerUp, and Passmark.

```bash
# One-shot run (writes directly to Postgres)
pnpm --filter @cgpu-max/scraper run:once

# Long-running worker (BullMQ recurring job every 6h by default)
pnpm --filter @cgpu-max/scraper dev
```

### API endpoints (current)

| Endpoint                                                                  | Auth       | Purpose                                                                                                                |
| ------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                                                             | —          | Liveness + Postgres + Redis checks                                                                                     |
| `GET /api/v1/processors`                                                  | optional   | List w/ `type`, `manufacturer`, `search`, `limit`, `offset`                                                            |
| `GET /api/v1/processors/:slug`                                            | optional   | Detail                                                                                                                 |
| `POST /api/v1/comparisons`                                                | optional   | `{ aSlug, bSlug, persist? }` → side-by-side analysis; counted against monthly FREE quota when authenticated            |
| `GET /api/v1/comparisons/:shareSlug`                                      | optional   | Saved comparison retrieval                                                                                             |
| `POST /api/v1/bottleneck/calculate`                                       | optional   | `{ cpuSlug, gpuSlug, persist? }` → 12-scenario matrix                                                                  |
| `GET /api/v1/bottleneck/:shareSlug`                                       | optional   | Saved bottleneck retrieval                                                                                             |
| `GET /api/v1/subscriptions/tiers`                                         | —          | Public tier limits table                                                                                               |
| `GET /api/v1/subscriptions/me`                                            | required   | Current tier, active subscription, monthly usage                                                                       |
| `POST /api/v1/billing/checkout`                                           | required   | `{ plan: pro_monthly \| pro_yearly }` → Stripe Checkout URL                                                            |
| `POST /api/v1/billing/portal`                                             | required   | Stripe Customer Portal URL                                                                                             |
| `POST /api/v1/billing/webhook`                                            | Stripe sig | Stripe event ingestion (idempotent)                                                                                    |
| `POST /api/v1/advisor/build`                                              | Pro        | `{ budgetUsd, purpose, resolution, preferences? }` → Claude-generated CPU+GPU recommendation (counts against AI quota) |
| `GET /api/v1/advisor/build/:shareSlug`                                    | required   | Owner's saved build                                                                                                    |
| `GET /api/v1/pricing/history/:slug`                                       | optional   | Price history (cached)                                                                                                 |
| `GET/POST/DELETE /api/v1/pricing/alerts`                                  | Pro        | Price-drop alerts                                                                                                      |
| `POST /api/v1/gaming/optimize`                                            | Pro        | Per-preset FPS prediction + settings                                                                                   |
| `POST /api/v1/streaming/plan`                                             | Pro        | Encoder + bitrate/bandwidth plan                                                                                       |
| `GET /api/v1/reports/{comparison,bottleneck}/:shareSlug?format=pdf\|xlsx` | Pro        | PDF/Excel export                                                                                                       |
| `GET/POST/DELETE /api/v1/api-keys`                                        | Enterprise | Manage API keys (dashboard, Clerk-authed)                                                                              |

### Public Enterprise API (API-key auth)

Mounted at `/api/public/v1`, authenticated with `Authorization: Bearer cgpu_live_…`, gated to the Enterprise tier, rate-limited per key.

| Endpoint                                   | Purpose                           |
| ------------------------------------------ | --------------------------------- |
| `GET /api/public/v1/openapi.json`          | OpenAPI 3.1 spec (public, no key) |
| `GET /api/public/v1/processors`            | List w/ filters                   |
| `GET /api/public/v1/processors/:slug`      | Detail                            |
| `POST /api/public/v1/comparisons`          | Compare                           |
| `POST /api/public/v1/bottleneck/calculate` | Bottleneck matrix                 |

The official Node client lives in [`packages/sdk`](./packages/sdk) (`@cgpu-max/sdk`).

Authenticated requests must include `Authorization: Bearer <Clerk JWT>`. Rate limits are tier-aware (FREE: 100/15min, PRO: 1000/15min, ENTERPRISE: 10k/15min) stored in Redis so they hold across instances.

## Next phases

See [CGPU-MAX-MASTER-PROMPT.md § Implementation Roadmap](./CGPU-MAX-MASTER-PROMPT.md). Phase 6 delivered the public REST API, API keys, OpenAPI spec, and Node SDK. Remaining: white-label/multi-tenant (Feature 12), data licensing (Feature 13), plus the deferred Phase 5 items (price tracking, gaming optimizer, streaming suite, PDF/Excel reports). Phase 7: scale & multi-region.

## Documentation

- [Master Prompt](./CGPU-MAX-MASTER-PROMPT.md) — single source of truth for product, architecture, and quality bars
- [Architecture](./CGPU-MAX-ARCHITECTURE.md) — system design details
- [Data Sources](./CGPU-MAX-DATA-SOURCES.md) — input feeds for Phase 2
- [Security policy](./SECURITY.md)
- [Contributing](./CONTRIBUTING.md)
