# =========================
# Base
# =========================
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat openssl

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# =========================
# Dependencies
# =========================
FROM base AS deps

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

COPY backend ./backend
COPY apps ./apps

RUN pnpm install --frozen-lockfile

# =========================
# Build
# =========================
FROM deps AS builder

WORKDIR /app/backend/api

RUN pnpm prisma generate

RUN pnpm build

# =========================
# Production
# =========================
FROM node:22-alpine

RUN apk add --no-cache openssl

ENV NODE_ENV=production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY --from=builder /app/backend/api/package.json ./
COPY --from=builder /app/backend/api/node_modules ./node_modules
COPY --from=builder /app/backend/api/dist ./dist
COPY --from=builder /app/backend/api/prisma ./prisma

EXPOSE 3000

CMD ["node","dist/main.js"]
