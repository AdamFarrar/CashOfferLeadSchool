
# Platform Architecture

This document describes the implemented architecture of the Cash Offer Conversion School platform as of Phase 1.7.

---

## Core Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS v4 |
| UI Components | Tailwind utilities + custom CSS classes (globals.css) |
| Backend | Next.js Server Actions, Node.js 20 |
| Database | Supabase Postgres, Drizzle ORM |
| Authentication | BetterAuth (email + password, organization plugin) |
| Email | Resend API + internal template engine |
| Analytics | PostHog (tracking + feature flags) |
| Deployment | Dokploy, Docker (multi-stage, standalone output) |
| CI/CD | GitHub Actions |
| Monorepo | pnpm workspaces, Turborepo |

---

## Authentication

BetterAuth handles all authentication. **Supabase Auth must not be used.**

Architecture:

```
Client → BetterAuth Client SDK → Next.js API routes → BetterAuth Server → Supabase Postgres
```

Session management:
- Cookie-based sessions with 30-day expiry
- Cookie cache enabled (5-minute TTL)
- Session update interval: 24 hours
- Email verification required before sign-in

Middleware:
- Edge middleware checks for cookie **presence only** (UX routing)
- Server actions call `auth.api.getSession()` for authoritative validation
- Server actions are the **real security boundary**

---

## RBAC Permission Model

Five roles with descending privilege:

```
owner > admin > instructor > student > prospect
```

12 resource types: `organization`, `member`, `invitation`, `course`, `episode`, `progress`, `coaching`, `qualification`, `analytics`, `settings`, `audit`, `billing`

Permissions are enforced via `requireAdmin()` guard in server actions. Role definitions are in `packages/auth/src/permissions.ts`.

---

## Multi-Tenant Schema

Organizations are the tenant boundary. Every domain table includes `organization_id`.

Tenant isolation is enforced at the application layer via:
- Server-side identity resolution (`getServerIdentity()`)
- Organization-scoped database queries
- BetterAuth organization plugin

Tables with `organization_id`:
- `qualification_form`
- `automation_rule`
- `automation_action_log`
- `email_template`
- `feedback`
- `audit_log`

---

## Event-Driven Architecture

Domain events drive side effects. No direct coupling between systems.

```
Server Action → emitDomainEvent() → Event Registry → [Listeners]
                                                       ├── Automation Engine
                                                       ├── Analytics Tracker
                                                       └── Audit Logger
```

8 domain events:
- `user_registered`
- `verification_email_requested`
- `email_verified`
- `password_requested`
- `qualification_submitted`
- `feedback_submitted`
- `template_published`
- `automation_rule_changed`

Resilience:
- `Promise.allSettled()` isolates listener failures
- Database-level idempotency via `uniqueIndex(event_id, rule_id)`
- In-memory dedup for `email_verified` events

---

## Automation Rule Pipeline

```
Event → Evaluator (match rules) → Planner (create actions) → Executor (dispatch)
```

Channels:
- `email` → Resend API via email executor
- `webhook` → HTTP POST with 3-layer SSRF protection

SSRF defense:
1. Pre-flight URL deny list (11 patterns)
2. `redirect: "manual"` — blocks 301→internal attacks
3. Response URL validation + 10s timeout

Condition evaluation supports 8 operators: `eq`, `neq`, `gt`, `lt`, `gte`, `lte`, `in`, `contains` with nested `AND`/`OR`.

---

## Email Template System

```
Admin creates template → GrapesJS editor → Save to DB
Event fires → Evaluator matches rule → Renderer pipeline → Resend sends
```

Renderer pipeline:
1. **Sanitize** — strip dangerous HTML (before variable injection)
2. **Validate** — check for missing placeholders
3. **Inject** — replace `{{key}}` with values
4. **Strip** — remove unresolved `{{key}}` (never shown to users)
5. **Inline CSS** — `juice()` for email client compatibility

---

## Analytics Tracking

PostHog handles:
- Behavior tracking (page views, CTA clicks, funnel events)
- Feature flags (experiment framework via `@cocs/experiments`)
- User identification

Analytics event contracts are defined in `packages/analytics/src/event-contracts.ts`.

Client-side tracking uses `@cocs/analytics` package with lazy PostHog initialization.

---

## Package Architecture

```
apps/
  web/                    → Next.js application

packages/
  auth/                   → BetterAuth server + client + permissions
  database/               → Drizzle schema + client (lazy Proxy init)
  services/               → Business logic (qualification, email templates, feedback)
  events/                 → Domain event types + emitter + registry
  email/                  → Renderer pipeline + sanitizer + sender
  automation/             → Rule evaluator + planner + executors (email, webhook)
  analytics/              → PostHog tracking + event contracts
  experiments/            → Feature flag wrapper
  ui/                     → UI component library (Button, Card, Input, Label, Dialog)
```

---

## Security Headers

Set in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `poweredByHeader: false`
