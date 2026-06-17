# 🎯 CGPU-MAX: MASTER PROMPT
## Production-Ready Application Development Specification

> **Use this prompt to instruct any AI assistant or development team to build CGPU-MAX from scratch with enterprise-grade quality, scalability, modularity, reliability, and security.**

---

## 📋 PROJECT BRIEF

Bangun aplikasi web full-stack bernama **CGPU-MAX** — sebuah platform komparasi dan analisis CPU/GPU profesional dengan model bisnis SaaS (freemium → pro → enterprise). Aplikasi harus production-ready, scalable hingga jutaan users, modular untuk maintainability jangka panjang, reliable dengan 99.9% uptime, dan secure mengikuti OWASP best practices.

---

## 🎨 PRODUCT VISION

**Nama:** CGPU-MAX  
**Tagline:** Hardware Intelligence Platform  
**Target Market:** PC builders, gamers, content creators, system integrators, OEMs  
**Bahasa Utama:** English (primary), Indonesian (secondary)  
**Geographic Focus:** Global, dengan fokus awal di Indonesia & Southeast Asia

### Core Value Propositions
1. Database CPU/GPU paling lengkap (Intel, AMD, Nvidia) dari semua generasi
2. Comparison engine dengan multi-metric analysis
3. Bottleneck calculator paling akurat (proprietary algorithm)
4. AI-powered build advisor
5. Real-time price tracking & market intelligence
6. Gaming & streaming optimization tools

---

## 🏗️ TECHNICAL ARCHITECTURE

### Tech Stack Requirements

```yaml
frontend:
  framework: Next.js 14+ (App Router)
  language: TypeScript (strict mode)
  ui_library: Tailwind CSS + shadcn/ui
  state_management: Zustand (lightweight) + React Query (server state)
  charts: Recharts + D3.js (advanced visualizations)
  forms: React Hook Form + Zod validation
  testing: Jest + React Testing Library + Playwright (E2E)
  
backend:
  runtime: Node.js 20 LTS
  framework: Express.js / Fastify (high performance)
  language: TypeScript (strict mode)
  database: PostgreSQL 15+ (primary) + Redis 7+ (cache/queue)
  orm: Prisma 5+
  queue: BullMQ (Redis-based)
  validation: Zod
  testing: Jest + Supertest
  
infrastructure:
  containerization: Docker + Docker Compose
  orchestration: Kubernetes (for scale) / Railway.app (MVP)
  ci_cd: GitHub Actions
  monitoring: Prometheus + Grafana + Sentry
  logging: Winston + ELK Stack
  cdn: Cloudflare
  
ai_integration:
  llm: Anthropic Claude API (build advisor, recommendations)
  embeddings: For semantic search
```

### Architecture Pattern

Implementasikan **Clean Architecture** dengan 4 layer:

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Next.js Frontend + API Routes) │
├─────────────────────────────────────────────────────┤
│  APPLICATION LAYER (Use Cases / Services)           │
├─────────────────────────────────────────────────────┤
│  DOMAIN LAYER (Entities, Business Logic)            │
├─────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER (DB, Cache, External APIs)    │
└─────────────────────────────────────────────────────┘
```

**Rules:**
- Inner layers tidak boleh tahu tentang outer layers
- Dependencies via interfaces (Dependency Inversion)
- Domain layer pure (no framework dependencies)
- Setiap module self-contained dengan clear boundaries

---

## 📦 MODULAR DESIGN

Struktur project mengikuti **Domain-Driven Design (DDD)**:

```
cgpu-max/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Base UI primitives (shadcn)
│   │   │   ├── features/       # Feature-specific components
│   │   │   └── layouts/        # Layout components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Frontend utilities
│   │   └── stores/             # Zustand stores
│   │
│   └── api/                    # Express backend
│       ├── modules/            # Feature modules (DDD bounded contexts)
│       │   ├── processors/     # CPU/GPU specs domain
│       │   ├── comparisons/    # Comparison engine domain
│       │   ├── bottleneck/     # Bottleneck calculator domain
│       │   ├── pricing/        # Price tracking domain
│       │   ├── users/          # User management domain
│       │   ├── subscriptions/  # Billing domain
│       │   └── ai-advisor/     # AI features domain
│       └── shared/             # Cross-cutting concerns
│           ├── middleware/
│           ├── utils/
│           └── config/
│
├── packages/                   # Shared monorepo packages
│   ├── types/                  # Shared TypeScript types
│   ├── ui/                     # Shared UI components
│   ├── config/                 # Shared configs (eslint, tsconfig)
│   └── sdk/                    # Client SDK for enterprise
│
└── services/                   # Microservices (optional, for scale)
    ├── scraper/                # Data collection service
    ├── price-monitor/          # Price tracking service
    └── notifier/               # Email/SMS notifications
```

### Module Template

Setiap module harus mengikuti structure ini:

```
modules/[module-name]/
├── domain/
│   ├── entities/           # Domain entities
│   ├── value-objects/      # Value objects
│   ├── repositories/       # Repository interfaces
│   └── services/           # Domain services
├── application/
│   ├── use-cases/          # Application use cases
│   ├── dto/                # Data Transfer Objects
│   └── mappers/            # Entity ↔ DTO mappers
├── infrastructure/
│   ├── persistence/        # Prisma implementations
│   ├── external/           # External API clients
│   └── cache/              # Redis cache implementations
├── interface/
│   ├── controllers/        # HTTP controllers
│   ├── routes/             # Express routes
│   └── validators/         # Request validators (Zod)
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🎯 CORE FEATURES (MVP — Free Tier)

### Feature 1: Processor Database
**Acceptance Criteria:**
- Display CPU/GPU specs dengan filtering: manufacturer, generation, type, price range
- Search dengan fuzzy matching (powered by Fuse.js / Meilisearch)
- Detailed view dengan semua specs + benchmark scores
- Responsive design (mobile-first)
- Lazy loading untuk performance
- Maximum 200ms response time untuk list queries

**Data Sources (Hybrid Approach):**
1. **Primary:** Geekbench API (real-time benchmarks)
2. **Secondary:** TechPowerUp web scraper (detailed specs)
3. **Tertiary:** Passmark scraper (pricing + market data)

### Feature 2: Comparison Engine
**Acceptance Criteria:**
- Side-by-side comparison (up to 3 processors di free tier)
- Multi-metric comparison: specs, benchmarks, price/performance, features
- Visual indicators untuk winner per category
- Shareable comparison URLs (e.g., `/compare/intel-i9-14900k-vs-amd-ryzen-9-9950x`)
- Comparison history (saved untuk 7 days di free, 1 year di pro)

### Feature 3: Bottleneck Calculator
**Acceptance Criteria:**
- Multi-resolution analysis (1080p, 1440p, 4K)
- Multi-game-type scenarios (esports, AAA, VR)
- Thermal & power analysis
- AI-generated recommendations
- Visual gauge dengan severity indicators
- Algorithm transparency (show calculation methodology)

### Feature 4: Search & Discovery
**Acceptance Criteria:**
- Global search dengan autocomplete (<100ms response)
- Filter combinations (price, performance, manufacturer)
- Sort by multiple criteria
- Save favorite processors

---

## 💎 PREMIUM FEATURES (Pro Tier — $9.99/month)

### Feature 5: AI Build Advisor
- Powered by Claude API
- Budget-based recommendations
- Purpose-specific optimization (gaming/streaming/workstation)
- Compatibility checking
- FPS predictions per game
- Upgrade roadmap (2-3 years)
- Power supply sizing

### Feature 6: Price Tracking & Alerts
- Monitor 10+ retailers
- Price history (12 months)
- Smart alerts (price drop %, target price, stock availability)
- Multi-channel notifications (email, SMS, push)
- Price predictions (ML-based)
- Affiliate links integration (revenue stream)

### Feature 7: Gaming Optimizer
- Game-specific settings recommendations (50+ games)
- FPS predictions per quality preset
- Thermal & power estimates
- DLSS/FSR optimization
- Regular updates untuk new games

### Feature 8: Streaming Suite
- Streaming configuration wizard
- Multi-platform support (Twitch, YouTube, Kick)
- Hardware encoder selection (NVENC, QuickSync, x264)
- Internet bandwidth calculator
- Real-time performance monitoring

### Feature 9: Custom Reports
- PDF export (professional formatting)
- Excel/CSV data export
- Custom branding (white-label option)
- Embedded charts & visualizations
- Multi-language support

### Feature 10: Advanced Analytics
- Performance tracking over time
- Community comparison
- Market sentiment analysis
- Trend predictions

---

## 🏢 ENTERPRISE FEATURES (Custom Pricing)

### Feature 11: REST API
- Unlimited API calls
- API key management
- Rate limiting per tier
- Comprehensive documentation (Swagger/OpenAPI)
- SDK untuk Node.js, Python, PHP
- Webhooks untuk real-time events
- 99.99% SLA

### Feature 12: White-Label Solution
- Custom domain support
- Full branding customization
- Theming engine
- Analytics dashboard
- Multi-tenant architecture

### Feature 13: Data Licensing
- Bulk data exports
- Real-time data feeds
- Custom data formats
- Compliance documentation

---

## 🎨 UI/UX REQUIREMENTS

### Design System

**Aesthetic:** Elegant, modern, futuristic, tetap clean dan readable

**Color Palette:**
```css
--primary-bg: #042C53          /* Deep blue (futuristic) */
--accent-blue: #185FA5         /* Intel blue */
--accent-coral: #993C1D        /* AMD coral */
--accent-purple: #534AB7       /* Nvidia accent */
--success: #0F6E56             /* Balanced/optimal states */
--warning: #BA7517             /* Caution states */
--danger: #A32D2D              /* Bottleneck/critical */
--surface-light: #FFFFFF
--surface-dark: #0A0E1A
--text-primary: #042C53
--text-secondary: #5F5E5A
```

**Typography:**
- Display font: Inter / Space Grotesk (futuristic geometric)
- Body font: Inter (clean, modern)
- Mono font: JetBrains Mono (data displays)
- Weight scale: 400 (regular), 500 (medium), 600 (semibold for headers only)
- Letter spacing untuk uppercase labels: 1.5px

**Visual Principles:**
1. **Flat & Clean:** No gradients, no shadows kecuali functional
2. **Generous whitespace:** Padding 16px-24px untuk cards
3. **Data-first:** Numbers dan metrics paling prominent
4. **Subtle animations:** Smooth transitions (200-300ms)
5. **Dark mode mandatory:** Semua komponen harus support dark/light mode
6. **Iconography:** Tabler Icons (outline only, consistent stroke)
7. **Rounded corners:** 8px (small), 12px (cards), 999px (pills)

**Component Library:**
- Cards dengan 0.5px border + subtle background
- Metric cards: muted label (10px uppercase) + large number (22-38px)
- Pills/badges untuk status (live, pro, winner, etc)
- Gauges dengan SVG untuk visualisasi
- Heat maps untuk scenario matrix
- Sparklines untuk price history

### Key Screens

1. **Dashboard** — Quick comparison + market intelligence strip
2. **Comparison Page** — Side-by-side dengan VS divider, performance bars
3. **Bottleneck Calculator** — Circular gauge + scenario matrix + thermal/power cards
4. **Build Advisor** — Wizard flow dengan budget slider + AI recommendations
5. **Price Tracker** — Charts + alert management + retailer comparison
6. **Processor Detail** — Full specs + benchmarks + reviews + price history
7. **User Account** — Subscription management + saved comparisons + alerts

---

## 🔐 SECURITY REQUIREMENTS

Implementasikan defense-in-depth security:

### Authentication & Authorization
- **Auth Provider:** Clerk / Auth.js (NextAuth) dengan multi-provider support
- **Methods:** Email/password, Google, GitHub, magic link
- **2FA:** TOTP support untuk pro/enterprise
- **Session:** JWT dengan short expiry (15 min) + refresh tokens (7 days)
- **RBAC:** Role-based access (user, pro, admin, enterprise)
- **Password:** bcrypt dengan cost factor 12, minimum 12 chars, strength meter

### API Security
```typescript
// MANDATORY middleware stack
app.use(helmet()); // Security headers
app.use(cors({ origin: ALLOWED_ORIGINS })); // CORS whitelist
app.use(rateLimit({ // Rate limiting
  windowMs: 15 * 60 * 1000,
  max: tier === 'free' ? 100 : tier === 'pro' ? 1000 : 10000
}));
app.use(slowDown({ // Brute force protection
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: 500
}));
app.use(validateInput()); // Zod validation
app.use(sanitizeOutput()); // XSS prevention
```

### Data Protection
- **Encryption at rest:** AES-256 untuk sensitive data (PII, payment info)
- **Encryption in transit:** TLS 1.3 mandatory, HSTS enabled
- **Database:** Parameterized queries only (Prisma handles ini)
- **Secrets:** AWS Secrets Manager / Vault (no env vars di production)
- **PII handling:** Minimal collection, automatic deletion after retention period
- **GDPR compliance:** Right to deletion, data export, consent management

### Payment Security
- **Provider:** Stripe (PCI DSS compliant, no card data touches our servers)
- **Webhooks:** Signature verification mandatory
- **Idempotency:** Use idempotency keys untuk semua mutations
- **Audit log:** Semua transactions logged dengan timestamp + user + IP

### Vulnerability Prevention
- **OWASP Top 10:** Address semua kategori
- **Dependencies:** Snyk / Dependabot untuk auto-updates
- **Security headers:** CSP, X-Frame-Options, X-Content-Type-Options
- **Input validation:** Zod schemas untuk SEMUA inputs
- **Output encoding:** Auto-escape via React (no `dangerouslySetInnerHTML`)
- **File uploads:** Type validation, virus scanning, size limits
- **Web scraping ethics:** Respect robots.txt, rate limiting, proper User-Agent

### Monitoring & Incident Response
- **Logging:** Structured logs (JSON) dengan correlation IDs
- **Anomaly detection:** Alert untuk unusual patterns (failed logins, spike in errors)
- **Incident response plan:** Documented procedures, defined roles
- **Regular audits:** Quarterly security reviews, annual pentest
- **Bug bounty:** Public program untuk responsible disclosure

---

## ⚡ SCALABILITY REQUIREMENTS

### Performance Targets
- **Page Load:** <2s LCP, <100ms FID, <0.1 CLS
- **API Response:** p50 <100ms, p95 <500ms, p99 <1s
- **Database:** Query time <50ms untuk 95% queries
- **Search:** <100ms response time
- **Concurrent users:** Handle 10,000 concurrent dengan single instance

### Scaling Strategy

**Vertical Scaling (Quick wins):**
- Database connection pooling (PgBouncer)
- Query optimization dengan EXPLAIN ANALYZE
- Index strategy untuk hot queries
- Redis caching layer

**Horizontal Scaling (Long-term):**
```yaml
load_balancer:
  type: Cloudflare / Nginx
  algorithm: round-robin with health checks
  
api_instances:
  min: 2 (HA)
  max: 20 (auto-scaling)
  trigger: CPU > 70% OR memory > 80%
  
database:
  primary: Single instance dengan read replicas
  read_replicas: 2-5 (geographic distribution)
  sharding: Implement at >10M records
  
cache:
  redis_cluster: 3 nodes minimum
  strategy: Cache-aside untuk read-heavy
  invalidation: Tag-based
  
cdn:
  static_assets: Cloudflare CDN
  api_cache: Edge caching untuk GET requests
  geographic_distribution: Global edge locations
```

### Caching Strategy

```typescript
// Multi-layer caching
const cacheConfig = {
  // Browser cache (immutable assets)
  browser: { maxAge: 31536000, immutable: true },
  
  // CDN cache (API responses)
  cdn: { 
    'GET /api/processors': '6 hours',
    'GET /api/comparisons/:id': '24 hours',
    'GET /api/market-data': '5 minutes'
  },
  
  // Application cache (Redis)
  redis: {
    'processor:*': 86400,        // 24 hours
    'benchmark:*': 604800,       // 7 days
    'price:*': 21600,            // 6 hours
    'user-session:*': 900,       // 15 minutes
    'search-index': 604800       // 7 days
  },
  
  // Database query cache (in-memory)
  app: {
    enabled: true,
    ttl: 60, // 60 seconds for hot queries
    maxSize: '500MB'
  }
};
```

### Async Processing
Use BullMQ untuk semua heavy/slow operations:
- Data scraping jobs (scheduled)
- Email/SMS notifications
- PDF report generation
- AI recommendation processing
- Price update jobs
- Search index updates

### Database Optimization
```sql
-- MANDATORY indexes
CREATE INDEX CONCURRENTLY idx_processors_type_mfr ON processors(type, manufacturer);
CREATE INDEX CONCURRENTLY idx_processors_search ON processors USING GIN(model_name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_benchmarks_processor ON benchmarks(processor_id, benchmark_type);
CREATE INDEX CONCURRENTLY idx_price_history_recent ON price_history(processor_id, recorded_at DESC);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email) WHERE deleted_at IS NULL;

-- Partitioning untuk large tables
CREATE TABLE price_history (
  ...
) PARTITION BY RANGE (recorded_at);

-- Materialized views untuk analytics
CREATE MATERIALIZED VIEW processor_rankings AS
SELECT ... FROM processors JOIN benchmarks ...;
REFRESH MATERIALIZED VIEW CONCURRENTLY processor_rankings; -- Schedule daily
```

---

## 🛡️ RELIABILITY REQUIREMENTS

### Availability Target
- **Free tier SLA:** 99.5% uptime (3.6 hours downtime/month)
- **Pro tier SLA:** 99.9% uptime (43 minutes downtime/month)
- **Enterprise SLA:** 99.99% uptime (4 minutes downtime/month)

### Resilience Patterns

**Circuit Breaker:**
```typescript
// Untuk external API calls (Geekbench, scraping)
const breaker = new CircuitBreaker(externalAPICall, {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
```

**Retry with Exponential Backoff:**
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await sleep(delay);
    }
  }
}
```

**Graceful Degradation:**
- Fallback ke cached data jika external API down
- Static JSON fallback jika database unavailable
- Reduced functionality mode untuk degraded performance
- Clear user messaging untuk service issues

**Health Checks:**
```typescript
// /health endpoint untuk load balancer
GET /health
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  checks: {
    database: { status: 'up', latency: 12 },
    redis: { status: 'up', latency: 1 },
    external_apis: { 
      geekbench: { status: 'up', last_success: '2 min ago' }
    }
  }
}
```

### Backup & Recovery
- **Database backups:** Automated daily snapshots + continuous WAL archiving
- **Retention:** 7 days hot, 30 days warm, 1 year cold
- **RTO:** Recovery Time Objective <1 hour
- **RPO:** Recovery Point Objective <5 minutes
- **Disaster recovery:** Multi-region failover capability
- **Regular drills:** Monthly recovery testing

### Error Handling
```typescript
// MANDATORY: Structured error handling
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true,
    public details?: unknown
  ) {
    super(message);
  }
}

// Global error handler
app.use((err, req, res, next) => {
  // Log dengan correlation ID
  logger.error({
    correlationId: req.id,
    error: err,
    user: req.user?.id,
    path: req.path
  });
  
  // User-friendly response (no stack traces in production)
  res.status(err.statusCode || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.isOperational ? err.message : 'Something went wrong',
      correlationId: req.id
    }
  });
});
```

### Monitoring Stack
```yaml
application_monitoring:
  - Sentry (error tracking + performance)
  - Datadog APM (distributed tracing)
  
infrastructure_monitoring:
  - Prometheus (metrics)
  - Grafana (dashboards)
  - AlertManager (alerting)
  
log_aggregation:
  - Winston (structured logging)
  - Elasticsearch + Kibana (search & analysis)
  
uptime_monitoring:
  - StatusPage.io (public status page)
  - UptimeRobot (synthetic monitoring)
  
business_metrics:
  - PostHog (product analytics)
  - Mixpanel (user behavior)
```

### SLO/SLI Definition
```yaml
service_level_objectives:
  availability:
    target: 99.9%
    measurement: successful_requests / total_requests
    
  latency:
    target: 95% of requests < 500ms
    measurement: p95 response time
    
  error_rate:
    target: < 0.1%
    measurement: 5xx errors / total requests
    
  data_freshness:
    target: 99% of data updated within 24h
    measurement: last_updated_at vs current_time
```

---

## 🚀 DEVELOPMENT PRACTICES

### Code Quality Standards
```yaml
typescript:
  strict: true
  noImplicitAny: true
  strictNullChecks: true
  
linting:
  - ESLint dengan recommended rules
  - Prettier untuk formatting
  - Husky pre-commit hooks
  - lint-staged untuk staged files only
  
testing:
  unit_coverage: minimum 80%
  integration_coverage: minimum 70%
  e2e_critical_paths: 100%
  
code_review:
  - All PRs require approval
  - Automated checks must pass
  - Conventional commits format
  - Squash and merge strategy
```

### Git Workflow
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
hotfix/* (emergency fixes)
release/* (release candidates)
```

### CI/CD Pipeline
```yaml
on_pull_request:
  - Lint & format check
  - TypeScript compilation
  - Unit tests
  - Integration tests
  - Security scan (Snyk, SAST)
  - Build verification
  - Preview deployment (Vercel/Railway)
  
on_merge_to_main:
  - All PR checks +
  - E2E tests
  - Performance benchmarks
  - Security scan (DAST)
  - Build production images
  - Deploy to staging
  - Smoke tests
  - Manual approval gate
  - Deploy to production (blue-green)
  - Post-deployment health checks
  - Rollback on failure
```

### Documentation Requirements
- **README:** Setup, development, deployment instructions
- **ARCHITECTURE.md:** System design, key decisions
- **API.md:** Generated dari OpenAPI specs
- **CONTRIBUTING.md:** Development guidelines
- **SECURITY.md:** Security policies, vulnerability reporting
- **CHANGELOG.md:** Versioned change history
- **Inline JSDoc:** Untuk semua public APIs
- **ADRs:** Architecture Decision Records untuk major decisions

---

## 💰 BUSINESS LOGIC

### Pricing Tiers

```yaml
free:
  price: $0
  limits:
    comparisons_per_month: 5
    saved_builds: 3
    price_alerts: 0
    ai_recommendations: 0
  features:
    - Basic specs viewer
    - Simple comparison (2 processors)
    - Basic bottleneck calculator
    - Community reviews (read-only)
  monetization:
    - Display ads (Google AdSense)
    - Affiliate links
    
pro:
  price: $9.99/month or $99/year (20% discount)
  limits:
    comparisons_per_month: unlimited
    saved_builds: unlimited
    price_alerts: 50
    ai_recommendations: 100/month
  features:
    - All free features (no ads)
    - Multi-comparison (up to 10)
    - Advanced bottleneck calculator
    - AI build advisor
    - Price tracking & alerts
    - Gaming optimizer
    - Streaming suite
    - Custom reports (PDF/Excel)
    - Performance history
    - Priority support
    
enterprise:
  price: custom (starting $2,000/month)
  features:
    - All pro features
    - Unlimited API access
    - White-label solution
    - Custom integrations
    - Data licensing
    - 99.99% SLA
    - Dedicated support
    - Onboarding & training
    - Custom feature development
```

### Revenue Streams
1. Subscription revenue (Pro tier) — primary
2. Enterprise contracts — high-value
3. Affiliate commissions (3-8%) — passive
4. Display ads (free tier) — supplementary
5. Sponsored content — periodic
6. Data licensing — strategic
7. Consulting services — premium

### Key Metrics to Track
```yaml
acquisition:
  - signups_per_day
  - traffic_sources
  - conversion_rate (visitor → signup)
  
activation:
  - first_action_within_7_days
  - feature_adoption_rate
  
retention:
  - dau_mau_ratio (stickiness)
  - day_1_retention
  - day_30_retention
  - churn_rate (monthly)
  
revenue:
  - mrr (monthly recurring revenue)
  - arr (annual recurring revenue)
  - arpu (average revenue per user)
  - ltv (lifetime value)
  - cac (customer acquisition cost)
  - ltv_cac_ratio (target: >3)
  - free_to_pro_conversion (target: 3-6%)
  
referral:
  - nps (net promoter score)
  - referral_rate
```

---

## 📅 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
**Deliverables:**
- Project setup dengan monorepo structure
- Authentication system (Clerk integration)
- Database schema + migrations
- Basic CI/CD pipeline
- Development environment dokumentasi

**Definition of Done:**
- All developers dapat menjalankan project locally
- Automated tests running di CI
- Staging environment deployed

### Phase 2: Data Foundation (Weeks 3-4)
**Deliverables:**
- Multi-source data collection service
- Processor database populated (>5000 CPUs/GPUs)
- Basic specs viewer dengan search
- API endpoints (GET /processors)
- Caching layer implemented

**Definition of Done:**
- Data refresh otomatis setiap 6 hours
- API response time <100ms
- 95%+ test coverage untuk data layer

### Phase 3: Core Features (Weeks 5-8)
**Deliverables:**
- Comparison engine
- Basic bottleneck calculator
- Comparison sharing (public URLs)
- User accounts & saved comparisons
- Public launch (MVP)

**Definition of Done:**
- Mobile responsive
- All P0 bugs fixed
- Lighthouse score >90 untuk semua key pages

### Phase 4: Monetization (Weeks 9-12)
**Deliverables:**
- Stripe integration
- Pro tier features (price tracking, AI advisor)
- Subscription management
- Payment flow + webhooks
- Pricing page

**Definition of Done:**
- Payment flow tested end-to-end
- Webhook signature verification working
- Failed payment handling implemented

### Phase 5: Premium Features (Weeks 13-16)
**Deliverables:**
- Advanced bottleneck calculator
- Gaming optimizer
- Streaming suite
- PDF/Excel reports
- Performance tracking

**Definition of Done:**
- All pro features documented
- Conversion funnel optimized
- Support documentation lengkap

### Phase 6: Enterprise (Weeks 17-20)
**Deliverables:**
- REST API dengan documentation
- API key management
- Rate limiting per tier
- Webhook system
- SDK packages (Node.js, Python)
- White-label foundation

**Definition of Done:**
- API documentation lengkap (Swagger)
- 99.9% uptime achieved
- First enterprise customer onboarded

### Phase 7: Scale & Optimization (Weeks 21-24)
**Deliverables:**
- Performance optimization
- Multi-region deployment
- Advanced monitoring
- Mobile app (React Native)
- International expansion (i18n)

**Definition of Done:**
- p95 latency <500ms globally
- 99.99% uptime SLA achievable
- Multi-language support active

---

## ✅ ACCEPTANCE CRITERIA

Project dianggap **complete & production-ready** ketika:

### Functional
- [ ] Semua MVP features berfungsi sesuai spec
- [ ] User registration → comparison → checkout flow works flawlessly
- [ ] Payment processing handles edge cases (failures, refunds, upgrades)
- [ ] Data freshness <24 hours untuk semua sources
- [ ] Search returns relevant results dalam <100ms

### Non-Functional
- [ ] **Security:** OWASP Top 10 mitigated, pentest passed
- [ ] **Performance:** Core Web Vitals targets met
- [ ] **Scalability:** Load test sukses untuk 10k concurrent users
- [ ] **Reliability:** 99.9% uptime untuk 30 hari berturut-turut
- [ ] **Accessibility:** WCAG 2.1 AA compliance
- [ ] **SEO:** Lighthouse SEO score >95
- [ ] **Mobile:** Responsive di semua viewport sizes

### Operational
- [ ] CI/CD pipeline fully automated
- [ ] Monitoring & alerting configured
- [ ] Backup & recovery tested
- [ ] Documentation complete & up-to-date
- [ ] Support workflows established
- [ ] Legal compliance (Terms, Privacy, GDPR)

### Business
- [ ] Pricing page live & tested
- [ ] Payment integration working (test + live mode)
- [ ] Analytics tracking implemented
- [ ] Email marketing setup
- [ ] Customer support tooling ready
- [ ] Status page operational

---

## 🎓 KEY PRINCIPLES (Non-Negotiable)

1. **Security First:** Setiap fitur baru harus melalui security review
2. **Performance Budget:** Bundle size <250KB initial, <1MB total
3. **Mobile First:** Design & develop untuk mobile, enhance untuk desktop
4. **Accessibility:** WCAG 2.1 AA minimum untuk SEMUA komponen
5. **Test Driven:** Write tests sebelum atau bersamaan dengan code
6. **Documentation:** Code without docs is incomplete
7. **Modular:** Setiap module harus dapat di-extract menjadi microservice
8. **Observable:** Setiap critical path harus instrumented
9. **Resilient:** Assume external dependencies will fail
10. **Iterative:** Ship small, ship often, measure everything

---

## 🤝 DEVELOPMENT TEAM STRUCTURE

### Recommended Team (MVP)
- **1 Tech Lead / Architect** — System design, code review
- **2 Full-Stack Developers** — Feature development
- **1 Frontend Specialist** — UI/UX implementation
- **1 DevOps Engineer** (part-time) — Infrastructure, CI/CD

### Scaling Team (Pro+)
- Tambah: 1 Backend Specialist (API, data)
- Tambah: 1 QA Engineer
- Tambah: 1 Product Manager
- Tambah: 1 Designer (UI/UX)

### Enterprise Team
- Tambah: Customer Success Manager
- Tambah: Solutions Engineer
- Tambah: Security Engineer
- Tambah: Data Engineer

---

## 📞 STAKEHOLDER COMMUNICATION

### Weekly Updates
- Progress vs roadmap
- Metrics dashboard
- Blockers & risks
- Upcoming priorities

### Monthly Reviews
- Feature adoption analytics
- Revenue metrics
- Customer feedback synthesis
- Roadmap adjustments

### Quarterly Planning
- Strategic priorities review
- Architecture evolution
- Team scaling decisions
- Investment planning

---

## 🎯 SUCCESS DEFINITION

**Year 1 Targets:**
- 100,000 registered users
- 4% free-to-pro conversion rate
- $60,000+ MRR
- 99.9% uptime achieved
- NPS score >50
- First enterprise customer signed

**Year 3 Vision:**
- 2,000,000 users globally
- $1.8M+ MRR ($21.6M ARR)
- 20+ enterprise customers
- Market leader dalam CPU/GPU comparison
- Acquisition target untuk major tech company

---

## 📋 USAGE INSTRUCTIONS

**Untuk AI Assistant (Claude, GPT, etc):**
Use this master prompt sebagai single source of truth untuk SEMUA development decisions. Ketika user meminta implementasi fitur, refer balik ke spec ini untuk:
- Architecture decisions
- Security requirements
- Performance targets
- Code quality standards
- Module structure

**Untuk Development Team:**
- Onboarding: Read entire document
- Daily reference: Bookmark untuk quick lookup
- Decision making: Use sebagai authority untuk technical disputes
- Updates: PR ke spec ini untuk perubahan signifikan

**Untuk Stakeholders:**
- Product roadmap reference
- Investment justification
- Hiring requirements
- Vendor selection criteria

---

**Document Version:** 1.0  
**Last Updated:** June 17, 2026  
**Owner:** Firman Ahmad  
**Status:** Production Specification ✅
