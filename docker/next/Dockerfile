# syntax=docker/dockerfile:1.7

############################
# Base
############################
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

############################
# Prune Workspace
############################
FROM base AS pruner

WORKDIR /repo

COPY . .

ARG APP_NAME

RUN pnpm dlx turbo@2.10.0 prune ${APP_NAME} --docker

############################
# Install Dependencies
############################
FROM base AS installer

WORKDIR /app

COPY --from=pruner /repo/out/json/ .
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /repo/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

COPY --from=pruner /repo/out/full/ .

# Copy missing root config files
COPY tsconfig.json ./tsconfig.json
COPY turbo.json ./turbo.json

ARG APP_NAME

WORKDIR /app/apps/${APP_NAME}

RUN pnpm build

############################
# Runtime
############################
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@10.16.1 --activate

WORKDIR /app

COPY --from=installer /app .

ARG APP_NAME

WORKDIR /app/apps/${APP_NAME}

EXPOSE 3000

CMD ["pnpm", "start"]