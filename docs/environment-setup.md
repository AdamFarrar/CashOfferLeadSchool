
# Environment Setup

This document describes the development and production environment for the Cash Offer Conversion School platform.

---

## Required Services

| Service | Purpose |
|---|---|
| Supabase | Postgres database, file storage |
| Resend | Transactional email delivery |
| PostHog | Analytics tracking, feature flags |
| GitHub | Source control, CI/CD (Actions) |
| Dokploy | Container deployment |

---

## Environment Variables

### Required

| Variable | Context | Description |
|---|---|---|
| `SUPABASE_DB_URL` | Server | Postgres connection string (pooled) |
| `BETTER_AUTH_SECRET` | Server | Session signing secret (min 32 chars) |
| `BETTER_AUTH_URL` | Server | Base URL for auth (e.g., `https://app.example.com`) |

### Email

| Variable | Context | Description |
|---|---|---|
| `RESEND_API_KEY` | Server | Resend API key for sending emails |
| `EMAIL_FROM` | Server | Sender address (e.g., `noreply@example.com`) |

### Analytics

| Variable | Context | Description |
|---|---|---|
| `NEXT_PUBLIC_POSTHOG_KEY` | Client | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Client | PostHog instance URL (default: `https://us.i.posthog.com`) |

### Optional

| Variable | Context | Description |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Client | Sentry error tracking DSN |
| `APP_BASE_URL` | Server | Application base URL for links in emails |

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9.x (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)

### Setup

```bash
# Clone and install
git clone <repo>
cd CashOfferLeadSchool
pnpm install

# Create local env file
cp .env.example .env.local
# Fill in SUPABASE_DB_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL

# Run dev server
pnpm dev
```

### Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server (Turborepo) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript checks |
| `pnpm test` | Run all tests (vitest) |
| `pnpm check:styles` | Inline style enforcement |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Production Dockerfile

Multi-stage build with pnpm, Next.js standalone output, and non-root runtime user.

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/*/package.json ./packages/*/
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build --filter=@cols/web

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
```

Key security features:
- Non-root runtime user (`nextjs:1001`)
- Standalone output (minimal runtime footprint)
- Multi-stage build (no dev dependencies in final image)
- `.dockerignore` excludes secrets, tests, .git

---

## Dokploy Deployment

1. Push to `main` branch
2. Dokploy detects push, builds Docker image using `Dockerfile`
3. Environment variables configured in Dokploy project settings
4. Container starts with `node apps/web/server.js`
5. Health check: `GET /api/health`

---

## CI/CD Pipeline

GitHub Actions runs on push/PR to `main`:

```
Install → Lint → Type Check → Test → Style Check → Build
```

Configuration: `.github/workflows/ci.yml`

All steps must pass before merge. Tests exclude `prpm-extract/` (vendored third-party).

---

## Next.js Configuration

Key settings in `next.config.ts`:

- `output: "standalone"` — for Docker deployment
- `transpilePackages` — all 9 monorepo packages
- `poweredByHeader: false` — security
- `compress: true` — gzip compression
- Security headers on all routes

---

## Database

Drizzle ORM with lazy client initialization (Proxy pattern) to avoid build-time failures.

Connection settings:
- Max connections: 10
- Idle timeout: 20s
- Connect timeout: 10s

Migrations managed via `drizzle-kit generate` / `drizzle-kit migrate`.
