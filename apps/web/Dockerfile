# syntax=docker/dockerfile:1.6
# See apps/api/Dockerfile — pnpm workspace symlinks require running from the
# built workspace image rather than a flat-node_modules runner.
FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/web/package.json apps/web/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @cgpu-max/web build

WORKDIR /repo/apps/web
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
