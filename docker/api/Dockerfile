# syntax=docker/dockerfile:1.7

############################
# Base
############################
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

############################
# Prune workspace
############################
FROM base AS pruner

WORKDIR /repo

COPY . .

RUN pnpm dlx turbo@2.10.0 prune api --docker

############################
# Install dependencies
############################
FROM base AS installer

WORKDIR /app

COPY --from=pruner /repo/out/json/ .
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /repo/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

COPY --from=pruner /repo/out/full/ .

############################
# Build API
############################

WORKDIR /app/backend/api

ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

RUN pnpm prisma generate

RUN pnpm run build

############################
# Runtime
############################
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

COPY --from=installer /app .

WORKDIR /app/backend/api

EXPOSE 4000

CMD ["node", "dist/main.js"]