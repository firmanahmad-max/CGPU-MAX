# syntax=docker/dockerfile:1.6
# The workspace uses pnpm with a symlinked .pnpm store, so a slimmed runner that
# only copies a flat node_modules can't resolve deps. We install + build once and
# run from the same image, keeping pnpm's store/symlinks intact.
FROM node:20-alpine AS base
# openssl is required by the Prisma query engine (and for version detection).
RUN apk add --no-cache openssl && corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml* package.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @cgpu-max/api db:generate
RUN pnpm --filter @cgpu-max/api build

WORKDIR /repo/apps/api
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/index.js"]
