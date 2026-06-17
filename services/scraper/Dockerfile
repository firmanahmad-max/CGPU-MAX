# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY services/scraper/package.json services/scraper/
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm --filter @cgpu-max/api db:generate
RUN pnpm --filter @cgpu-max/scraper build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/services/scraper/dist ./dist
COPY --from=build /repo/services/scraper/package.json ./
COPY --from=build /repo/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
