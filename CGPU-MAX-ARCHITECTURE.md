# CGPU-MAX: CPU/GPU Comparison Application
## Complete Architecture & Implementation Guide

---

## 1. PROJECT OVERVIEW

**Application Name:** CGPU-MAX  
**Purpose:** Comprehensive CPU/GPU specification viewer & comparator  
**Target Users:** Tech enthusiasts, PC builders, gamers, system administrators  
**Key Features:**
- CPU/GPU specification database (Intel, AMD, Nvidia)
- Side-by-side comparison engine
- Bottleneck calculator
- Price-to-performance analysis
- Market sentiment tracking
- Responsive, modular architecture

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    CGPU-MAX SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           FRONTEND LAYER (React/Next.js)             │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ • Specs Viewer    • Comparator    • Analyzer    │ │   │
│  │  │ • Dashboard       • Search Engine • Real-time   │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          API LAYER (Gateway & Services)              │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │ • /api/specs      • /api/compare                │ │   │
│  │  │ • /api/search     • /api/bottleneck             │ │   │
│  │  │ • /api/benchmark  • /api/market-sentiment       │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │       BUSINESS LOGIC LAYER (Core Engines)            │   │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐  │   │
│  │  │ Specs    │ Compare  │ Benchmark│ Bottleneck   │  │   │
│  │  │ Engine   │ Engine   │ Calc     │ Calculator   │  │   │
│  │  └──────────┴──────────┴──────────┴──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         DATA LAYER (Multi-Source)                    │   │
│  │  ┌──────────┬────────────┬────────────┬──────────┐  │   │
│  │  │ Local DB │ Cache      │ External   │ Market   │  │   │
│  │  │ (JSON)   │ (Redis)    │ APIs       │ Feeds    │  │   │
│  │  └──────────┴────────────┴────────────┴──────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. RECOMMENDED TECH STACK

### Frontend
```
├── Framework: Next.js 14+ (React 18+)
├── UI Library: Tailwind CSS + shadcn/ui
├── State Management: Zustand / Redux Toolkit
├── Data Fetching: React Query / SWR
├── Charts: Recharts / Chart.js
├── Search: Fuse.js (client-side) + Meilisearch (server)
└── Deployment: Vercel / Railway
```

### Backend
```
├── Runtime: Node.js (LTS)
├── Framework: Express.js / Fastify / Hono
├── Database: PostgreSQL (specs) + Redis (cache)
├── ORM: Prisma / TypeORM
├── Task Queue: Bull (Redis) untuk update data
├── API Documentation: Swagger/OpenAPI
└── Deployment: Railway.app / Render / Docker
```

### Data Sources
```
├── CPU/GPU Specs: Internal JSON + TechPowerUp Scraper
├── Benchmarks: CPU-Z, Geekbench, 3DMark (API/scraper)
├── Pricing: Amazon API, Scapehawk, manual feeds
├── Sentiment: Tech forums, Reddit API, News feeds
└── Real-time: WebSocket untuk live updates
```

---

## 4. DATABASE SCHEMA

### Core Tables

#### `processors` (CPU/GPU)
```sql
CREATE TABLE processors (
  id UUID PRIMARY KEY,
  type ENUM('CPU', 'GPU'),
  manufacturer ENUM('Intel', 'AMD', 'Nvidia'),
  model_name VARCHAR(255),
  code_name VARCHAR(100),
  generation INT,
  release_date DATE,
  
  -- Core Specs
  cores INT,
  threads INT,
  base_clock DECIMAL(4,2),
  boost_clock DECIMAL(4,2),
  cache_l3 INT,
  tdp INT,
  architecture VARCHAR(100),
  process_nm INT,
  
  -- GPU Specific
  vram_gb INT,
  vram_type VARCHAR(50),
  memory_bandwidth INT,
  shader_units INT,
  
  -- Pricing & Market
  msrp_usd DECIMAL(10,2),
  current_price_usd DECIMAL(10,2),
  price_updated_at TIMESTAMP,
  market_sentiment DECIMAL(3,2), -- 0-5 score
  sentiment_sources INT,
  
  -- Metadata
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  data_quality_score INT, -- 0-100
  
  UNIQUE(manufacturer, model_name, generation)
);

CREATE INDEX idx_type_manufacturer ON processors(type, manufacturer);
CREATE INDEX idx_model_search ON processors USING GIN(model_name gin_trgm_ops);
```

#### `benchmarks`
```sql
CREATE TABLE benchmarks (
  id UUID PRIMARY KEY,
  processor_id UUID REFERENCES processors(id),
  benchmark_type VARCHAR(50), -- 'geekbench', 'cinebench', '3dmark', etc
  workload VARCHAR(100),
  score DECIMAL(10,2),
  score_normalized DECIMAL(10,2), -- untuk perbandingan lintas-benchmark
  percentile INT,
  tested_at DATE,
  source_url TEXT,
  
  UNIQUE(processor_id, benchmark_type, workload),
  FOREIGN KEY(processor_id) REFERENCES processors(id)
);

CREATE INDEX idx_processor_benchmark ON benchmarks(processor_id, benchmark_type);
```

#### `market_data`
```sql
CREATE TABLE market_data (
  id UUID PRIMARY KEY,
  processor_id UUID REFERENCES processors(id),
  price_usd DECIMAL(10,2),
  availability VARCHAR(50), -- 'in_stock', 'limited', 'pre_order'
  retailer VARCHAR(100),
  url TEXT,
  recorded_at TIMESTAMP,
  
  FOREIGN KEY(processor_id) REFERENCES processors(id)
);

CREATE INDEX idx_processor_market ON market_data(processor_id, recorded_at DESC);
```

#### `comparisons`
```sql
CREATE TABLE comparisons (
  id UUID PRIMARY KEY,
  user_id UUID, -- null untuk public comparisons
  processor_1_id UUID REFERENCES processors(id),
  processor_2_id UUID REFERENCES processors(id),
  comparison_type VARCHAR(50), -- 'cpu', 'gpu', 'mixed'
  results JSONB, -- cached comparison results
  bottleneck_percentage INT,
  created_at TIMESTAMP,
  view_count INT DEFAULT 0,
  
  UNIQUE(processor_1_id, processor_2_id)
);
```

---

## 5. API ENDPOINTS SPECIFICATION

### CPU/GPU Specs Endpoints

```
GET    /api/v1/processors
       • Query: type, manufacturer, generation, search_query
       • Response: {id, model_name, cores, threads, clock, price, ...}

GET    /api/v1/processors/:id
       • Response: Complete specs + benchmarks + market data

GET    /api/v1/processors/search
       • Query: q (search string)
       • Response: Auto-complete suggestions + results

GET    /api/v1/manufacturers
       • Response: List of Intel, AMD, Nvidia with latest models
```

### Comparison Engine

```
POST   /api/v1/comparisons
       • Body: {processor_1_id, processor_2_id}
       • Response: {
           processor_1: {...full specs},
           processor_2: {...full specs},
           comparison_matrix: {
             performance_score_1: 85,
             performance_score_2: 92,
             features_alignment: {...},
             price_per_performance_1: 2.5,
             price_per_performance_2: 2.8,
             winner_category: {...}
           },
           bottleneck: null (jika GPU vs GPU)
         }

GET    /api/v1/comparisons/:id
       • Response: Retrieve saved comparison
```

### Bottleneck Calculator

```
POST   /api/v1/bottleneck/calculate
       • Body: {cpu_id, gpu_id, resolution: '1080p'|'1440p'|'4k', game_type}
       • Response: {
           bottleneck_percentage: 25,
           limiting_component: 'GPU',
           explanation: "GPU akan dibatasi oleh CPU sebesar...",
           recommendations: {...}
         }

GET    /api/v1/bottleneck/compatibility-chart
       • Query: {cpu_id, resolution}
       • Response: List GPU dengan bottleneck % per GPU
```

### Benchmarking & Analytics

```
GET    /api/v1/benchmarks/:processor_id
       • Response: All benchmark scores from different sources

GET    /api/v1/rankings
       • Query: {category: 'gaming'|'productivity', resolution}
       • Response: Top 10 processors dengan scores

GET    /api/v1/market-sentiment/:processor_id
       • Response: {
           overall_score: 4.2,
           sources: [
             {source: 'reddit', sentiment: 4.5, mentions: 234},
             {source: 'tech_forums', sentiment: 3.9, mentions: 156}
           ],
           trends: [...]
         }
```

---

## 6. MODULAR ARCHITECTURE DESIGN

### Frontend Modules

```
src/
├── components/
│   ├── Common/
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Loading.tsx
│   ├── Specs/
│   │   ├── SpecsViewer.tsx
│   │   ├── SpecsDetail.tsx
│   │   ├── SpecsTable.tsx
│   │   └── FilterPanel.tsx
│   ├── Comparator/
│   │   ├── ComparatorUI.tsx
│   │   ├── ProcessorSelector.tsx
│   │   ├── ComparisonMatrix.tsx
│   │   ├── ComparisonChart.tsx
│   │   └── DetailedAnalysis.tsx
│   ├── Bottleneck/
│   │   ├── BottleneckCalculator.tsx
│   │   ├── CompatibilityChart.tsx
│   │   └── BottleneckResult.tsx
│   ├── Analytics/
│   │   ├── BenchmarkChart.tsx
│   │   ├── MarketAnalysis.tsx
│   │   ├── PriceHistory.tsx
│   │   └── SentimentDisplay.tsx
│   └── Advanced/
│       ├── BenchmarkComparator.tsx
│       ├── PriceCalculator.tsx
│       └── TrendAnalyzer.tsx
│
├── pages/
│   ├── index.tsx (Dashboard)
│   ├── specs/[id].tsx
│   ├── compare.tsx
│   ├── bottleneck.tsx
│   ├── analytics.tsx
│   └── advanced.tsx
│
├── hooks/
│   ├── useProcessors.ts
│   ├── useComparison.ts
│   ├── useBottleneck.ts
│   └── useMarketData.ts
│
├── store/
│   ├── processorStore.ts
│   ├── comparisonStore.ts
│   └── uiStore.ts
│
├── services/
│   ├── api/
│   │   ├── specsApi.ts
│   │   ├── comparisonApi.ts
│   │   ├── bottleneckApi.ts
│   │   └── analyticsApi.ts
│   ├── cache/
│   │   └── cacheManager.ts
│   └── workers/
│       └── searchWorker.ts
│
└── utils/
    ├── formatters.ts
    ├── calculators.ts
    ├── validators.ts
    └── constants.ts
```

### Backend Modules

```
src/
├── controllers/
│   ├── processorController.ts
│   ├── comparisonController.ts
│   ├── bottleneckController.ts
│   ├── benchmarkController.ts
│   └── marketController.ts
│
├── services/
│   ├── processorService.ts
│   ├── comparisonEngine.ts
│   ├── bottleneckCalculator.ts
│   ├── benchmarkAggregator.ts
│   ├── marketDataCollector.ts
│   └── sentimentAnalyzer.ts
│
├── models/
│   ├── Processor.ts
│   ├── Benchmark.ts
│   ├── MarketData.ts
│   ├── Comparison.ts
│   └── UserHistory.ts
│
├── routes/
│   ├── processorRoutes.ts
│   ├── comparisonRoutes.ts
│   ├── bottleneckRoutes.ts
│   ├── analyticsRoutes.ts
│   └── healthRoutes.ts
│
├── middleware/
│   ├── auth.ts
│   ├── rateLimit.ts
│   ├── errorHandler.ts
│   ├── requestLogger.ts
│   └── cacheMiddleware.ts
│
├── jobs/
│   ├── dataUpdateJob.ts (Update CPU/GPU specs)
│   ├── benchmarkSyncJob.ts (Sync benchmarks)
│   ├── marketDataJob.ts (Price updates)
│   ├── sentimentAnalysisJob.ts (Market sentiment)
│   └── cleanupJob.ts (Cache cleanup)
│
├── external/
│   ├── techpowerupScraper.ts
│   ├── geekbenchAPI.ts
│   ├── amazonPriceAPI.ts
│   ├── redditSentiment.ts
│   └── newsFeeds.ts
│
├── utils/
│   ├── logger.ts
│   ├── validators.ts
│   ├── errorhandlers.ts
│   └── helpers.ts
│
└── config/
    ├── database.ts
    ├── cache.ts
    ├── env.ts
    └── constants.ts
```

---

## 7. KEY CALCULATION ENGINES

### 7.1 Bottleneck Calculator Algorithm

```javascript
/**
 * Bottleneck Percentage Calculation
 * Based on: CPU clock × threads vs GPU compute power
 */

class BottleneckCalculator {
  
  calculate(cpu: Processor, gpu: Processor, resolution: string): BottleneckResult {
    // Normalisasi scores
    const cpuPerformance = this.normalizeCPUPerformance(cpu);
    const gpuPerformance = this.normalizeGPUPerformance(gpu);
    
    // Faktor resolusi
    const resolutionFactor = {
      '1080p': 1.0,
      '1440p': 1.3,
      '4k': 1.8
    }[resolution];
    
    // Hitung adjusted GPU performance
    const adjustedGPUPerformance = gpuPerformance * resolutionFactor;
    
    // Calculate bottleneck
    const bottleneckPercentage = this.calculateBottleneck(
      cpuPerformance,
      adjustedGPUPerformance
    );
    
    // Determine limiting component
    const limitingComponent = bottleneckPercentage > 10 
      ? 'CPU' 
      : bottleneckPercentage < -10 
      ? 'GPU' 
      : 'Balanced';
    
    return {
      bottleneckPercentage: Math.abs(bottleneckPercentage),
      limitingComponent,
      severity: this.getSeverity(Math.abs(bottleneckPercentage)),
      recommendations: this.getRecommendations(bottleneckPercentage)
    };
  }
  
  normalizeCPUPerformance(cpu: Processor): number {
    // Formula: (cores × base_clock + threads × boost_clock) / reference_value
    const coreScore = cpu.cores * cpu.base_clock;
    const boostScore = (cpu.threads - cpu.cores) * cpu.boost_clock;
    return (coreScore + boostScore) / 100; // Normalisasi
  }
  
  normalizeGPUPerformance(gpu: Processor): number {
    // Formula: (shader_units × clock_speed × memory_bandwidth) / reference_value
    const computeScore = gpu.shader_units * gpu.boost_clock;
    const memoryScore = gpu.memory_bandwidth / 100;
    return (computeScore + memoryScore) / 1000;
  }
  
  calculateBottleneck(cpuScore: number, gpuScore: number): number {
    // Jika GPU >> CPU, bottleneck positif (CPU menjadi hambatan)
    // Jika CPU >> GPU, bottleneck negatif (GPU menjadi hambatan)
    const ratio = (gpuScore - cpuScore) / cpuScore;
    return ratio * 100;
  }
  
  getSeverity(percentage: number): string {
    if (percentage <= 5) return 'Optimal';
    if (percentage <= 10) return 'Minor';
    if (percentage <= 20) return 'Moderate';
    if (percentage <= 30) return 'Significant';
    return 'Severe';
  }
}
```

### 7.2 Performance Scoring Engine

```javascript
class PerformanceScorer {
  
  /**
   * Generate comprehensive performance score (0-100)
   */
  scoreProcessor(processor: Processor, category: 'gaming'|'productivity'|'workstation'): number {
    let score = 0;
    
    if (category === 'gaming') {
      // GPU-centric scoring
      score += this.scoreGPUGaming(processor) * 0.5;
      score += this.scoreCPUGaming(processor) * 0.3;
      score += this.scoreMemoryBandwidth(processor) * 0.2;
    } else if (category === 'productivity') {
      // Multi-threaded CPU focus
      score += this.scoreCPUProductivity(processor) * 0.6;
      score += this.scoreMemory(processor) * 0.3;
      score += this.scorePower(processor) * 0.1;
    }
    
    return Math.round(score);
  }
  
  scoreCPUProductivity(cpu: Processor): number {
    // Threads × clock speed relative to top CPU
    const topThreadClock = 64 * 5.7; // Max known spec
    const threadClockScore = (cpu.threads * cpu.boost_clock) / topThreadClock;
    
    const cacheScore = cpu.cache_l3 / 96; // Normalized to 96MB
    
    return (threadClockScore * 0.7 + cacheScore * 0.3) * 100;
  }
  
  scoreGPUGaming(gpu: Processor): number {
    // VRAM × shader units × clock speed
    const topGPUScore = 24 * 18176 * 2.5; // RTX 4090 specs
    const gpuScore = gpu.vram_gb * gpu.shader_units * gpu.boost_clock;
    
    return (gpuScore / topGPUScore) * 100;
  }
}
```

### 7.3 Price-to-Performance Ratio

```javascript
class PricePerformanceCalculator {
  
  calculate(processor: Processor, performanceScore: number): number {
    // $ per performance point
    if (!processor.current_price_usd || processor.current_price_usd === 0) {
      return null;
    }
    
    return (processor.current_price_usd / performanceScore).toFixed(2);
  }
  
  getValueRating(processor: Processor, performanceScore: number, category: string): string {
    const ppp = this.calculate(processor, performanceScore);
    
    // Bandingkan dengan average dalam kategori
    const categoryAverage = this.getCategoryAverage(category);
    
    if (ppp < categoryAverage * 0.8) return 'Excellent';
    if (ppp < categoryAverage) return 'Good';
    if (ppp < categoryAverage * 1.2) return 'Average';
    if (ppp < categoryAverage * 1.5) return 'Poor';
    return 'Bad Value';
  }
}
```

---

## 8. CACHING STRATEGY

```javascript
// Redis Cache Layers
const cacheConfig = {
  // Specs: update monthly
  'processor:*': {
    ttl: 2592000, // 30 days
    tags: ['processor', 'specs']
  },
  
  // Benchmarks: update weekly
  'benchmark:*': {
    ttl: 604800, // 7 days
    tags: ['benchmark']
  },
  
  // Market data: update daily
  'market:*': {
    ttl: 86400, // 24 hours
    tags: ['market']
  },
  
  // Comparisons: cache user searches for 12 hours
  'comparison:*': {
    ttl: 43200, // 12 hours
    tags: ['comparison']
  },
  
  // Search index: update weekly
  'search:index': {
    ttl: 604800,
    tags: ['search']
  }
};
```

---

## 9. ADVANCED FEATURES ROADMAP

### Phase 1 (MVP)
- ✅ CPU/GPU specs viewer
- ✅ Basic comparison
- ✅ Bottleneck calculator (simple formula)
- ✅ Dashboard

### Phase 2 (Q2)
- Build recommendations engine
- Market sentiment analysis
- Price history tracking
- Advanced filtering

### Phase 3 (Q3)
- User accounts & saved comparisons
- Custom benchmark suite
- AI-powered recommendations
- API for third-party integrations

### Phase 4 (Q4)
- Real-time stock tracking
- Community reviews & ratings
- Thermal analysis
- Power consumption optimizer

---

## 10. DEPLOYMENT & DEVOPS

### Docker Containerization

```dockerfile
# Frontend Dockerfile (Multistage)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

### Infrastructure as Code (Docker Compose)

```yaml
version: '3.9'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/cgpu_max
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cgpu_max
      - POSTGRES_PASSWORD=securepassword
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 11. PERFORMANCE OPTIMIZATION CHECKLIST

```
Frontend:
☐ Code splitting & lazy loading
☐ Image optimization (WebP, AVIF)
☐ Virtual scrolling untuk large lists
☐ Service Worker untuk offline support
☐ CDN untuk static assets
☐ Minification & compression (gzip/brotli)

Backend:
☐ Database query optimization (indexes, pagination)
☐ API response caching
☐ Connection pooling
☐ Rate limiting & throttling
☐ Compression middleware
☐ Request/response optimization

Data:
☐ Incremental data loading
☐ Data pagination (limit 50-100 per request)
☐ Full-text search indexing
☐ Data compression in transit
```

---

## 12. SECURITY CONSIDERATIONS

```
✓ Input validation & sanitization
✓ CORS & CSRF protection
✓ Rate limiting per IP/API key
✓ SQL injection prevention (ORM + parameterized queries)
✓ XSS prevention (Content Security Policy)
✓ HTTPS enforcement
✓ API key rotation
✓ Database encryption at rest
✓ Audit logging
✓ Regular dependency updates
```

---

## 13. TESTING STRATEGY

```
Unit Tests (Jest):
- Calculators (bottleneck, scoring)
- Validators
- Utilities

Integration Tests:
- API endpoints
- Database operations
- Cache behavior

E2E Tests (Cypress/Playwright):
- Comparison flow
- Bottleneck calculation
- Search functionality

Performance Tests:
- Load testing (k6)
- Lighthouse CI
- API response time benchmarks
```

---

## 14. MONITORING & ANALYTICS

```
Tools:
- Application Monitoring: Sentry / New Relic
- Performance: Google Analytics 4 / Mixpanel
- Infrastructure: Prometheus / Grafana
- Logs: ELK Stack / CloudWatch
- Uptime: StatusPage / UptimeRobot

Metrics to Track:
- API response times
- Database query performance
- User engagement (comparison count, searches)
- Error rates
- Cache hit ratio
- Data freshness
```

---

## NEXT STEPS

1. **Decide tech stack** based on team expertise
2. **Setup development environment** (Node.js, PostgreSQL, Redis)
3. **Create initial database** with processor data
4. **Build core API endpoints** for specs & comparison
5. **Develop frontend** with React/Next.js
6. **Implement caching layer** with Redis
7. **Setup automated jobs** for data updates
8. **Create bottleneck calculator** with formulas
9. **Build comparison analytics** engine
10. **Deploy MVP** to production
11. **Setup monitoring** & performance tracking
12. **Iterate** based on user feedback

---

**Architecture Version:** 3.0  
**Last Updated:** May 2026  
**Status:** Ready for Implementation  
**Estimated Dev Time:** 8-12 weeks (MVP)

