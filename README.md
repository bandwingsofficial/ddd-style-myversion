# Sugar ERP Monorepo

A production-ready ERP monorepo built with **NestJS**, **Next.js**, **PostgreSQL**, **Redis**, **Docker**, and **Turbo**.

---

# Tech Stack

## Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis
* Bull Queue
* JWT Authentication

---

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Query

---

## Infrastructure

* Docker
* Docker Compose
* Nginx Reverse Proxy
* PostgreSQL
* Redis

---

# Repository Structure

```
.
├── apps
│   ├── backoffice-web
│   ├── customer-web
│   ├── delivery-web
│   └── outlet-admin-web
│
├── backend
│   └── api
│
├── docker
│   ├── api
│   ├── next
│   └── nginx
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

---

# Applications

| Application  | Default Port |
| ------------ | -----------: |
| API          |         4000 |
| Customer Web |         3000 |
| Backoffice   |         3001 |
| Outlet Admin |         3002 |
| Delivery     |         3003 |

---

# Requirements

* Node.js 22+
* pnpm
* Docker Desktop

---

# Local Development

Install dependencies

```bash
pnpm install
```

Run all applications

```bash
pnpm dev
```

Run a specific app

```bash
pnpm --filter customer-web dev
```

Run API

```bash
pnpm --filter api dev
```

---

# Build

Build everything

```bash
pnpm build
```

Build a specific application

```bash
pnpm --filter customer-web build
```

---

# Docker

Build everything

```bash
docker compose up -d --build
```

Start existing containers

```bash
docker compose up -d
```

Stop everything

```bash
docker compose down
```

View logs

```bash
docker compose logs -f
```

---

# Docker Images

The repository contains reusable Dockerfiles.

```
docker/
├── api/
│   └── Dockerfile
│
├── next/
│   └── Dockerfile
│
└── nginx/
    ├── Dockerfile
    ├── nginx.conf
    └── conf.d/
```

---

# Environment Variables

Every application has its own environment file.

```
backend/api/.env
backend/api/.env.example

apps/customer-web/.env
apps/customer-web/.env.example

apps/backoffice-web/.env
apps/backoffice-web/.env.example

apps/outlet-admin-web/.env
apps/outlet-admin-web/.env.example

apps/delivery-web/.env
apps/delivery-web/.env.example
```

Never commit real `.env` files.

Only commit `.env.example`.

---

# Production

Production deployment uses

* Docker Compose
* Nginx Reverse Proxy
* PostgreSQL
* Redis

Typical domains

```
example.com
www.example.com

api.example.com

admin.example.com

delivery.example.com

outlet.example.com
```

---

# Database

Prisma ORM is used for database access.

Generate Prisma Client

```bash
pnpm prisma generate
```

Run migrations

```bash
pnpm prisma migrate deploy
```

Create a migration

```bash
pnpm prisma migrate dev
```

---

# Useful Docker Commands

Build API

```bash
docker build -f docker/api/Dockerfile -t sugar-api .
```

Build Customer

```bash
docker build -f docker/next/Dockerfile --build-arg APP_NAME=customer-web -t customer-web .
```

Build Backoffice

```bash
docker build -f docker/next/Dockerfile --build-arg APP_NAME=backoffice-web -t backoffice-web .
```

Build Delivery

```bash
docker build -f docker/next/Dockerfile --build-arg APP_NAME=delivery-web -t delivery-web .
```

Build Outlet Admin

```bash
docker build -f docker/next/Dockerfile --build-arg APP_NAME=outlet-admin-web -t outlet-admin-web .
```

---

# Deployment

Deployment is designed for Docker-based platforms such as:

* VPS
* Coolify
* Railway
* Render
* DigitalOcean
* AWS EC2

---

# License

Private Project.
