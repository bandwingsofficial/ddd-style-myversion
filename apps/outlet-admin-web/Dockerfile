# ===========================
# Base
# ===========================
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# ===========================
# Install Dependencies
# ===========================
FROM base AS deps

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

COPY apps ./apps
COPY backend ./backend
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# ===========================
# Build
# ===========================
FROM deps AS builder

WORKDIR /app/apps/outlet-admin-web

RUN pnpm build

# ===========================
# Production
# ===========================
FROM node:22-alpine

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY --from=builder /app/apps/outlet-admin-web ./

EXPOSE 3000

CMD ["pnpm", "start"]
