# Cash Offer Lead School (COCS)

A SaaS platform for real estate operators to learn cash offer lead conversion. Features operator qualification onboarding, organization-based multi-tenancy, and role-based access control.

**Live:** [https://cashofferleadschool.com](https://cashofferleadschool.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Framework | Next.js 15 (App Router, standalone output) |
| Language | TypeScript (strict) |
| Auth | BetterAuth (email/password, org plugin, RBAC) |
| Database | Supabase Postgres 17 via Drizzle ORM |
| Email | Resend (transactional, verification emails) |
| Analytics | PostHog (typed event contracts) |
| Error Tracking | Sentry |
| Hosting | Dokploy (Docker Swarm on GCP) |
| CDN / SSL | Cloudflare (Full SSL) |
| CSS | Vanilla CSS (custom design system) |

---

## Project Structure

```
├── apps/
│   └── web/                → Next.js application
│       ├── app/            → App Router pages & API routes
│       │   ├── (auth)/     → Login, register, verify-email
│       │   ├── (dashboard)/→ Dashboard, qualification, etc.
│       │   ├── (marketing)/→ Landing page
│       │   ├── actions/    → Server Actions (mutations)
│       │   └── api/        → API routes (auth, health)
│       └── public/         → Static assets
├── packages/
│   ├── auth/               → BetterAuth server + client config
│   ├── database/           → Drizzle schema, client, migrations
│   ├── services/           → Business logic layer
│   ├── analytics/          → PostHog typed event tracking
│   └── ui/                 → Shared components (planned)
├── docker/
│   └── Dockerfile          → Multi-stage production build
├── docs/                   → Architecture docs, event contracts
├── tests/                  → Vitest test suite
└── turbo.json              → Turborepo pipeline config
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase project (Postgres)
- Resend account (for email verification)

### Setup

```bash
# Clone
git clone https://github.com/AdamFarrar/CashOfferLeadSchool.git
cd CashOfferLeadSchool

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Fill in values in .env.local

# Push database schema
pnpm db:push

# Start dev server
pnpm dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_DB_URL` | Postgres connection string (session mode, port 5432) |
| `BETTER_AUTH_SECRET` | Auth secret (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | App URL (`http://localhost:3000` or production URL) |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest endpoint |

---

## Key Architecture Decisions

- **Server Actions for mutations** — All writes go through Next.js Server Actions. Identity is resolved server-side from the session cookie, never trusted from client input.
- **Lazy DB client** — Database client uses a `Proxy` for lazy initialization, preventing build-time failures when env vars aren't available.
- **Typed analytics** — Event contracts define schema and version for every tracked event. PostHog events are validated at compile time.
- **RLS deny-all** — All Supabase tables have Row Level Security enabled with deny-all policies. The app connects as the `postgres` superuser (bypasses RLS). This blocks any direct access via Supabase's anon key.
- **Auto-org on signup** — Every new user gets a personal organization created automatically. The dashboard auto-sets the active org on first load.

---

## Development

```bash
# Dev server (with hot reload)
pnpm dev

# Build for production
pnpm turbo build --filter=@cocs/web

# Run tests
pnpm test

# Push schema changes to Supabase
pnpm db:push
```

---

## Deployment

Deployed via Dokploy with auto-deploy on push to `main`.

```bash
git push origin main
# Dokploy auto-builds and deploys via Docker
```

### Docker Build

The Dockerfile (`docker/Dockerfile`) uses a multi-stage build:

1. **deps** — Installs all dependencies
2. **builder** — Builds Next.js standalone output
3. **runner** — Alpine-based production image (~150MB)

### Infrastructure

- **Server:** GCP instance at `35.188.36.19`
- **Reverse Proxy:** Traefik (managed by Dokploy)
- **SSL:** Cloudflare Full SSL + Let's Encrypt
- **DNS:** Cloudflare (proxied)

---

## Database

10 tables managed via Drizzle ORM:

| Table | Purpose |
|---|---|
| `user` | User accounts |
| `session` | Active sessions |
| `account` | Auth provider accounts |
| `verification` | Email verification tokens |
| `organization` | Organizations (multi-tenancy) |
| `member` | Org membership + RBAC roles |
| `invitation` | Org invitations |
| `qualification_form` | Operator qualification data |
| `feedback_entry` | Stakeholder feedback |
| `audit_log` | Action audit trail |

---

## License

Private. All rights reserved.
