# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed — Runnable without third-party secrets

- **Optional auth** — all Clerk usage now routes through a single shim (`apps/web/src/lib/auth.tsx`). When `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is unset the app boots anonymously: `ClerkProvider`/middleware are skipped, `SignedIn`/`UserButton` render nothing, `SignedOut` renders its children, and auth hooks return safe no-op values. With the key present, full Clerk auth is restored. Sign-in/up pages show a friendly "auth not configured" notice instead of crashing.
- **Richer seed** — `prisma/seed.ts` now loads 6 CPUs + 7 GPUs across Intel/AMD/Nvidia with benchmark scores and price history (idempotent), so a fresh install has data to browse, compare, bottleneck, and trend.
- **Quickstart** — README documents a no-accounts local run; `.env.example` marks Clerk/Stripe/Anthropic as optional.

### Added — Data Licensing (Feature 13)

- **`licensing` module (DDD)** — pure serializers (`toCsv` with RFC-4180 escaping, `toNdjson`, fixed-column ordering) with unit tests; `ExportCatalog` does cursor-paginated bulk export of the processor catalog (keyset on primary key → bounded memory for large pulls) plus a dataset `manifest` (formats, CPU/GPU counts, last-updated, license terms).
- **Routes** on the public API (`/api/public/v1/licensing/{manifest,export}`) — API-key auth + the namespace-wide `apiAccess` gate, layered with a `dataLicensing` feature check. Export supports `format=json|csv|ndjson`, `type`, `cursor`, `limit`; the next cursor is returned in the body (json) or the `X-Next-Cursor` header (csv/ndjson). OpenAPI spec updated.
- **TierPolicy** — new `dataLicensing` feature flag (Enterprise only).

### Added — White-label foundation (Feature 12)

- **`organizations` module (DDD)** — multi-tenant foundation. Pure `branding` domain (hex-color + hostname validation, domain normalization, org slugify, theme merge over platform defaults) with unit tests. `OrganizationService` covers create (creator becomes OWNER), list-mine, update-branding (OWNER/ADMIN, validates colors + unique custom domain), add-member by email (OWNER), and public theme resolution by custom domain.
- **Routes** — Enterprise-gated management at `/api/v1/orgs` (`requireFeature('whiteLabel')`): create, `GET /me`, `PATCH /:id/branding`, `POST /:id/members`. Public `GET /api/v1/branding/by-domain/:domain` (cached) so a white-label frontend can theme itself by hostname.
- **Prisma** — `Organization` (brand name/logo/colors + unique `customDomain`) and `OrganizationMember` (OrgRole OWNER/ADMIN/MEMBER) + `User.orgMemberships`.
- **Web** — Enterprise-gated `/account/organization`: create org and edit brand name, logo, primary/secondary colors (with swatch preview), and custom domain; link surfaced on the account page when the tier has white-label.

### Added — Phase 7 (Observability, Analytics, Edge caching)

- **Observability** — `prom-client` registry with default Node metrics plus an `http_request_duration_seconds` histogram and `http_requests_total` counter; metrics middleware labels by matched route _pattern_ (not concrete path) to bound cardinality; `GET /metrics` Prometheus scrape endpoint.
- **Advanced Analytics (Feature 10)** — Redis sorted-set counters (no per-event DB writes): processor views and comparison pairs are incremented fire-and-forget on the hot path from the route layer. `GET /api/v1/analytics/trending` and `/popular-comparisons` return cached, CDN-friendly leaderboards (hydrated from the DB, ranking order preserved). Pure `rankEntries`/`parseWithScores` helpers with unit tests.
- **Edge caching** — `Cache-Control: public` headers on public read endpoints (processors list/detail ~6h, analytics ~5m) per the spec's CDN caching strategy.

### Added — Phase 5 Custom Reports

- **`reports` module** — server-side PDF (pdfkit) and Excel (exceljs) export of saved comparisons and bottleneck analyses, rendered from the persisted JSON snapshots. Brand-styled PDF layout and formatted XLSX worksheets. `GET /api/v1/reports/{comparison,bottleneck}/:shareSlug?format=pdf|xlsx` (Pro-gated via `customReports`), streamed with `Content-Disposition` attachment headers.
- **Web** — `ReportExportButtons` client component on the shared comparison/bottleneck pages: fetches the file as an authed blob (Clerk JWT) and triggers a client-side download; PDF + Excel buttons.

### Added — Phase 5 remainder (Pricing, Gaming, Streaming)

- **`pricing` module** — public cached price-history endpoint (`GET /api/v1/pricing/history/:slug`); Pro price-drop alerts (`GET/POST/DELETE /api/v1/pricing/alerts`) with `priceAlertsMax` enforced per tier; pure crossing logic in `domain/alertEvaluation.ts` with unit tests. Prisma `PriceAlert` model (target/direction/channel, triggered state) + enums `AlertDirection`/`AlertChannel`.
- **Scraper alert evaluation** — after each ingestion run the scraper compares active alerts to the latest recorded price and marks crossings (`triggeredAt`/`triggeredPriceUsd`, deactivates); notification dispatch deferred to the Phase 7 notifier.
- **`gaming-optimizer` module** — deterministic FPS predictor (`domain/GamingOptimizer.ts`, v2026.06.0): per-preset avg + 1%-low FPS from GPU power scaled by resolution × game profile, CPU frame ceiling, recommended preset, DLSS/FSR/XeSS upscaling pick, and settings tips. `POST /api/v1/gaming/optimize` (Pro-gated). Unit tests.
- **`streaming` module** — encoder selection (NVENC/QuickSync/AMF/x264 by GPU brand) + bitrate/bandwidth calculator capped by platform max and upload headroom, with warnings (`domain/StreamingAdvisor.ts`). `POST /api/v1/streaming/plan` (Pro-gated). Unit tests.
- **Web** — `/gaming` and `/streaming` Pro wizards; price history summary + "Track price" alert widget on the processor detail page; nav links.

### Added — Phase 6 Enterprise API

- **`api-keys` module (DDD)** — `domain/keygen.ts` generates `cgpu_live_…` keys, stores only the SHA-256 hash plus a non-secret display prefix; `Create`/`List`/`Revoke` use cases (revoke is owner-scoped via `updateMany`); Clerk-authed + Enterprise-gated management routes at `/api/v1/api-keys`. Plaintext is returned exactly once. Unit tests for key generation.
- **API-key auth middleware** (`shared/auth/apiKeyMiddleware.ts`) — resolves `Authorization: Bearer` / `x-api-key` to `req.auth` via hash lookup, rejecting missing/invalid/expired/revoked keys; best-effort `lastUsedAt` stamp that never blocks the request.
- **Public Enterprise API** at `/api/public/v1` — API-key auth → `requireFeature('apiAccess')` → per-tier Redis rate limit, reusing the existing processors/comparisons/bottleneck use cases. Mounted before the Clerk-oriented global middleware so it isn't double-limited or treated as anonymous.
- **OpenAPI 3.1 spec** served at `/api/public/v1/openapi.json` (public, no key).
- **`@cgpu-max/sdk`** — typed, fetch-based Node client (`listProcessors`, `getProcessor`, `compare`, `bottleneck`) with a `CgpuMaxApiError`, configurable `baseUrl`, and injectable `fetch`.
- **Prisma** — `ApiKey` model (hashed key unique, prefix, scopes, expiry, revoke, lastUsed) + `User.apiKeys` relation.
- **Web `/account/api-keys`** — list/create/revoke with one-time key reveal; Enterprise-gated messaging; link surfaced on the account page when the tier has API access.

### Added — Phase 5 AI Build Advisor

- **`ai-advisor` module (DDD)** — Claude-powered build recommendation. `domain/` holds the `BuildAdvice` type, the structured-output JSON schema, and a prompt builder that injects a live catalog slice (CPUs + GPUs in budget range) so the model recommends real parts and returns matching slugs. `application/GenerateBuildAdvice` enforces the monthly `aiRecommendations` quota, calls Claude via `messages.parse()` with `claude-opus-4-8`, adaptive thinking, and `output_config.format` (structured outputs), handles the `refusal` stop reason, then grounds the result (drops hallucinated slugs) and persists a `SavedBuild`.
- **Anthropic SDK integration** — `@anthropic-ai/sdk` with lazy client init; model + key via `ANTHROPIC_MODEL` / `ANTHROPIC_API_KEY` env.
- **Feature-gate middleware** — `requireFeature('aiAdvisor')` returns 402 with an upgrade hint when the caller's tier lacks the feature; layered after `requireAuth` on the advisor route.
- **Routes** — `POST /api/v1/advisor/build` (Pro-gated, quota-counted) and `GET /api/v1/advisor/build/:shareSlug` (owner-scoped).
- **Prisma** — `SavedBuild` table (budget/purpose/resolution + JSON payload + model used + share slug); back-relation on `User`.
- **Web `/advisor`** — Pro wizard with budget slider, purpose + resolution pickers, free-text preferences; `SignedOut` shows an upgrade prompt; `BuildAdviceResult` renders the structured recommendation with linked catalog parts, PSU sizing, upgrade path, and warnings. Handles 402/429 with clear messaging.

### Added — Phase 4 Monetization

- **Auth**: Clerk integration end-to-end. API `withUser` middleware verifies the JWT (`@clerk/backend`), upserts a local `User` row by `clerkUserId`, and attaches `req.auth` (or `null` for anonymous). `requireAuth` / `requireRole('ADMIN')` guards protect billing + admin routes. Web wraps the layout in `ClerkProvider` with brand-tokened appearance, adds `clerkMiddleware`, sign-in/sign-up catch-all routes, and `NavBar` with `UserButton`.
- **Subscriptions module (DDD)**: `TierPolicy` is the single source of truth for FREE/PRO/ENTERPRISE limits and feature flags — mirrors Master Prompt § Pricing Tiers exactly. `EnforceUsageLimit` atomically bumps a per-(user, feature, month) counter and throws 429 with structured detail on overflow. `SyncSubscriptionFromStripe` translates Stripe subscription objects into our enum + writes both `Subscription` and the derived `User.tier`. `GET /api/v1/subscriptions/{tiers,me}` routes; `GetMySubscription` returns tier + active subscription + current period usage.
- **Billing module**: Lazy Stripe SDK initialization. `CreateCheckoutSession` ensures a Stripe customer exists (lazy create + link back to user), creates a subscription Checkout, and returns the hosted URL. `CreatePortalSession` returns a Customer Portal URL. `HandleStripeWebhook` verifies signatures, persists every event id to `StripeWebhookEvent` for idempotency (uniqueness on `id` short-circuits replays), and dispatches `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`. The webhook route is mounted **before** `express.json()` so the raw body reaches `stripe.webhooks.constructEvent`.
- **Tier-aware rate limiter** at `apps/api/src/shared/middleware/tieredRateLimit.ts`: Redis-backed (`rate-limit-redis`) so limits hold across horizontally-scaled instances; key = userId for authed requests, IP otherwise; max comes from `TierPolicy.apiRequestsPer15min`. Replaces the global limiter in `server.ts`.
- **Usage enforcement** in `CompareProcessors`: authenticated calls increment the `comparisons` counter and 429 once the FREE cap (5/month) is hit; PRO/ENTERPRISE pass through.
- **Prisma additions**: `Subscription` (Stripe ids, status enum, billing interval, period bounds, cancel-at-period-end), `UsageCounter` (unique on `user × feature × period`), `StripeWebhookEvent` (idempotency ledger); `User.stripeCustomerId` unique. Enums `SubscriptionStatus`, `BillingInterval`.
- **Web**: `/pricing` page with three plans and direct-to-Stripe checkout buttons; `/account` dashboard showing tier, period usage with progress bars, and a "Manage billing" button that opens the Stripe portal; both use the new `useAuthedFetch` hook that attaches the Clerk JWT.

### Added — Phase 3 Core Features

- **API: `comparisons` module (DDD)** — pure `ComparisonEngine` scoring CPU vs CPU (and GPU vs GPU) across spec + benchmark metrics with per-metric winner, Δ%, normalized performance index, and price-performance ranking; `CompareProcessors` use case persists results to `SavedComparison` with a deterministic sorted-pair share slug; `GET /api/v1/comparisons/:shareSlug` for share retrieval; tests for engine invariants.
- **API: `bottleneck` module (DDD)** — deterministic `BottleneckAlgorithm` v2026.06.0 with explicit, auditable weight tables for 3 resolutions × 4 profiles; benchmark-first scoring with spec-based fallbacks; severity buckets per spec; thermal estimate + recommended PSU sizing; recommendation strings; persisted results via `SavedBottleneck`; `GET /api/v1/bottleneck/:shareSlug`; algorithm tests.
- **Prisma schema additions** — `SavedComparison` and `SavedBottleneck` tables with `shareSlug`, `payload` JSON snapshot, optional `ownerId`, expiry column for retention enforcement; back-relations on `Processor` and `User`.
- **Web: `/compare`** — type toggle (CPU/CPU or GPU/GPU), dual `ProcessorPicker` with live search, results table with VS divider, performance index cards, winner highlighting, share slug surface.
- **Web: `/bottleneck`** — CPU + GPU pickers, SVG `BottleneckGauge`, full 12-scenario matrix with severity-colored cells and FPS estimates, thermal/power/PSU stats, recommendation list.
- **Web: share routes** — `/compare/[shareSlug]` and `/bottleneck/[shareSlug]` server components that hydrate saved snapshots (ISR-cacheable).

### Added — Phase 2 Data Foundation

- `services/scraper`: TypeScript port of the legacy data collector with Geekbench, TechPowerUp, and Passmark source adapters; retry-with-backoff HTTP client; BullMQ recurring scheduler (`SCRAPER_CRON`, default every 6h); Prisma-backed upsert pipeline that merges source rows by slug and accumulates benchmarks + price history.
- API: Redis cache layer (`apps/api/src/shared/cache`) with tag-based invalidation, applied to `ListProcessors` (short TTL) and `GetProcessorBySlug` (24h TTL) per the spec's caching strategy.
- API: Redis health check added alongside Postgres check.
- Web: `/processors` browse page with type/manufacturer filters and search; `/processors/[slug]` detail page; reusable `Pill` and `ProcessorCard` components honoring the manufacturer color tokens.
- `cli/run-once.ts` in scraper for ad-hoc one-shot ingestion.

### Added — Phase 1 Foundation

- Monorepo scaffold (pnpm workspaces + Turborepo).
- `@cgpu-max/config` shared TypeScript + ESLint presets.
- `@cgpu-max/types` shared domain types (processor, comparison, bottleneck, user).
- `apps/api`: Express + Prisma + Pino, DDD module template, processors module skeleton, health check, structured error handler, correlation IDs, Zod env validation.
- `apps/web`: Next.js 14 App Router + Tailwind with design tokens from spec, landing page.
- Prisma schema: `Processor`, `CpuSpecs`, `GpuSpecs`, `BenchmarkScore`, `PriceHistory`, `User` + enums.
- `docker-compose.yml` for Postgres + Redis + API + Web.
- GitHub Actions CI: lint, type-check, test, build.
- Husky + lint-staged pre-commit hook.
- Docs: README, SECURITY, CONTRIBUTING.
