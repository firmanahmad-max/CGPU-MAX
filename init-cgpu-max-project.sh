#!/bin/bash
# CGPU-MAX Project Initialization Script
# Creates complete project structure with all necessary files

set -e

echo "🚀 Initializing CGPU-MAX Project Structure..."

# Create root directory
mkdir -p cgpu-max
cd cgpu-max

# ============ ROOT LEVEL FILES ============
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*.lock
yarn.lock
pnpm-lock.yaml

# Environment
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/
.turbo/

# IDE
.vscode/
.idea/
*.swp
*.swo
*.sublime-workspace

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Cache
.cache/
.eslintcache
.stylelintcache
EOF

cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
EOF

cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "next/core-web-vitals"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", ".next"]
}
EOF

# ============ FRONTEND STRUCTURE ============
mkdir -p frontend/{src,public}

cat > frontend/package.json << 'EOF'
{
  "name": "cgpu-max-frontend",
  "version": "1.0.0",
  "description": "CPU/GPU Comparison Web Application - Frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next": "^14.2.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.28.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.4.0",
    "clsx": "^2.1.0",
    "fuse.js": "^7.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
EOF

mkdir -p frontend/src/{components,pages,hooks,services,store,types,utils,styles}

# ============ BACKEND STRUCTURE ============
mkdir -p backend/{src,tests,scripts}

cat > backend/package.json << 'EOF'
{
  "name": "cgpu-max-backend",
  "version": "1.0.0",
  "description": "CPU/GPU Comparison API - Backend",
  "private": true,
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "node scripts/migrate.ts",
    "seed": "node scripts/seed.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.0",
    "helmet": "^7.1.0",
    "redis": "^4.6.0",
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0",
    "dotenv": "^16.3.0",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "bull": "^4.11.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0",
    "tsx": "^4.7.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0"
  }
}
EOF

mkdir -p backend/src/{controllers,services,models,routes,middleware,jobs,external,utils,config}

# ============ FRONTEND FILES ============

cat > frontend/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
EOF

cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        dark: '#1f2937',
      },
    },
  },
  plugins: [],
};
EOF

cat > frontend/src/pages/index.tsx << 'EOF'
import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>CGPU-MAX | CPU/GPU Comparison Tool</title>
        <meta name="description" content="Compare CPUs and GPUs side by side" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <header className="bg-slate-950 border-b border-slate-700">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-400">CGPU-MAX</h1>
            <ul className="flex gap-8">
              <li><a href="/specs" className="hover:text-blue-400">Specs</a></li>
              <li><a href="/compare" className="hover:text-blue-400">Compare</a></li>
              <li><a href="/bottleneck" className="hover:text-blue-400">Bottleneck</a></li>
            </ul>
          </nav>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4">CPU & GPU Comparison Simplified</h2>
            <p className="text-xl text-slate-400 mb-8">
              Compare processors, analyze performance, and find the perfect match
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold">
                Browse Specs
              </button>
              <button className="border border-blue-400 hover:bg-blue-400 hover:text-slate-900 px-8 py-3 rounded-lg font-semibold">
                Start Comparing
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold mb-2">📊 Comprehensive Specs</h3>
              <p className="text-slate-400">Browse detailed specifications for Intel, AMD, and Nvidia processors</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold mb-2">⚡ Bottleneck Calculator</h3>
              <p className="text-slate-400">Analyze CPU-GPU compatibility and find bottleneck percentages</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h3 className="text-xl font-bold mb-2">💰 Price Analysis</h3>
              <p className="text-slate-400">Compare prices and calculate price-to-performance ratios</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
EOF

cat > frontend/src/types/index.ts << 'EOF'
export interface Processor {
  id: string;
  type: 'CPU' | 'GPU';
  manufacturer: 'Intel' | 'AMD' | 'Nvidia';
  modelName: string;
  codeName: string;
  generation: number;
  releaseDate: string;
  
  // Core specs
  cores: number;
  threads: number;
  baseClock: number;
  boostClock: number;
  cache: number;
  tdp: number;
  architecture: string;
  processNm: number;
  
  // GPU specific
  vramGb?: number;
  shaderUnits?: number;
  memoryBandwidth?: number;
  
  // Pricing & market
  msrpUsd: number;
  currentPrice: number;
  marketSentiment: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonResult {
  processor1: Processor;
  processor2: Processor;
  winner: 'processor1' | 'processor2' | 'tied';
  metrics: ComparisonMetrics;
}

export interface ComparisonMetrics {
  performanceScore1: number;
  performanceScore2: number;
  pricePerformance1: number;
  pricePerformance2: number;
  features: FeatureComparison;
}

export interface FeatureComparison {
  [key: string]: ComparisonValue;
}

export interface ComparisonValue {
  processor1: any;
  processor2: any;
  winner: 'processor1' | 'processor2' | 'tied';
}

export interface BottleneckResult {
  bottleneckPercentage: number;
  limitingComponent: 'CPU' | 'GPU' | 'Balanced';
  severity: 'Optimal' | 'Minor' | 'Moderate' | 'Significant' | 'Severe';
  recommendations: string[];
}
EOF

# ============ BACKEND FILES ============

cat > backend/src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';

config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes (to be implemented)
app.get('/api/v1/processors', (req, res) => {
  res.json({ message: 'GET /processors endpoint' });
});

app.post('/api/v1/comparisons', (req, res) => {
  res.json({ message: 'POST /comparisons endpoint' });
});

app.post('/api/v1/bottleneck/calculate', (req, res) => {
  res.json({ message: 'POST /bottleneck/calculate endpoint' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOF

cat > backend/.env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cgpu_max
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# External APIs
TECHPOWERUP_API_KEY=your_key_here
GEEKBENCH_API_KEY=your_key_here
AMAZON_API_KEY=your_key_here

# Logging
LOG_LEVEL=debug
EOF

cat > backend/src/config/database.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
EOF

cat > backend/src/config/redis.ts << 'EOF'
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('✓ Redis connected'));

export default client;
EOF

# ============ DOCKER FILES ============

cat > docker-compose.yml << 'EOF'
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: cgpu-max-postgres
    environment:
      POSTGRES_DB: cgpu_max
      POSTGRES_USER: cgpu_user
      POSTGRES_PASSWORD: cgpu_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cgpu_user -d cgpu_max"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: cgpu-max-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: cgpu-max-backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://cgpu_user:cgpu_password@postgres:5432/cgpu_max
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: ./frontend
    container_name: cgpu-max-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
EOF

cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
EOF

cat > frontend/Dockerfile << 'EOF'
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
EOF

# ============ DOCUMENTATION ============

cat > README.md << 'EOF'
# CGPU-MAX - CPU/GPU Comparison Tool

A comprehensive web application for comparing CPUs and GPUs, analyzing performance metrics, calculating bottlenecks, and evaluating price-to-performance ratios.

## Features

- 📊 **Comprehensive Specifications**: Browse detailed specs for Intel, AMD, and Nvidia processors
- ⚡ **Bottleneck Calculator**: Analyze CPU-GPU compatibility
- 💰 **Price Analysis**: Compare prices and value metrics
- 🔍 **Advanced Search**: Find processors by specifications
- 📈 **Benchmarking**: Compare performance across different workloads
- 🌐 **Market Sentiment**: Real-time community feedback

## Tech Stack

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)

### Backend
- Node.js
- Express.js
- PostgreSQL
- Redis
- Prisma ORM

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/cgpu-max.git
cd cgpu-max
```

2. Setup with Docker Compose
```bash
docker-compose up
```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Manual Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

## Project Structure

```
cgpu-max/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── jobs/
│   └── package.json
└── docker-compose.yml
```

## API Documentation

### Get Processors
```
GET /api/v1/processors?type=CPU&manufacturer=Intel
```

### Compare Two Processors
```
POST /api/v1/comparisons
Body: {
  "processor_1_id": "uuid",
  "processor_2_id": "uuid"
}
```

### Calculate Bottleneck
```
POST /api/v1/bottleneck/calculate
Body: {
  "cpu_id": "uuid",
  "gpu_id": "uuid",
  "resolution": "1440p"
}
```

## Development Guide

### Adding New Features

1. **Database Changes**: Update Prisma schema in `backend/prisma/schema.prisma`
2. **API Endpoints**: Add routes in `backend/src/routes/`
3. **Frontend Components**: Create in `frontend/src/components/`
4. **Services**: Add business logic in `backend/src/services/`

### Testing

```bash
# Frontend tests
cd frontend && npm run test

# Backend tests
cd backend && npm run test
```

## Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

**Backend:**
```bash
cd backend
npm run build
npm run start
```

### Docker Deployment

```bash
docker-compose -f docker-compose.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [x] Basic architecture
- [ ] MVP implementation
- [ ] Benchmarking integration
- [ ] Market sentiment analysis
- [ ] User accounts & saved comparisons
- [ ] API for third-party integrations
EOF

echo "✅ Project structure created successfully!"
echo ""
echo "📁 Directory structure:"
tree -L 2 2>/dev/null || find . -maxdepth 2 -type d | sort
echo ""
echo "🚀 Next steps:"
echo "1. cd cgpu-max"
echo "2. docker-compose up"
echo "3. Open http://localhost:3000"
echo ""
echo "📖 Check CGPU-MAX-ARCHITECTURE.md for detailed design documentation"
EOF

chmod +x init-project.sh

echo "✅ Initialization script created!"
echo ""
echo "To create the project structure, run:"
echo "  bash init-project.sh"
