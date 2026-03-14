
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
- Feature flags (experiment framework via `@cols/experiments`)
- User identification

Analytics event contracts are defined in `packages/analytics/src/event-contracts.ts`.

Client-side tracking uses `@cols/analytics` package with lazy PostHog initialization.

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

---

## Content-Anchored Discussion System (Phase 4+ Constraint)

> **This section defines a binding architecture rule. It must be enforced before any discussion or community feature is implemented.**

### Rule

All discussion threads must be anchored to program content. No global forums. No free-floating comments.

Allowed content anchors:

```
program_id  → program-level discussion
module_id   → module-level discussion
episode_id  → episode-level discussion
```

Every thread must reference at least one content anchor. Threads without a content anchor must be rejected at the service layer.

### Thread Data Model

When discussions are implemented, the following structure must be used:

```
content_thread
    id              UUID PK
    program_id      UUID FK → program.id (required)
    module_id       UUID FK → module.id (nullable)
    episode_id      UUID FK → episode.id (nullable)
    created_by      UUID FK → user.id
    created_at      TIMESTAMPTZ

content_post
    id              UUID PK
    thread_id       UUID FK → content_thread.id
    user_id         UUID FK → user.id
    body            TEXT
    created_at      TIMESTAMPTZ
    edited_at       TIMESTAMPTZ

content_reaction
    id              UUID PK
    post_id         UUID FK → content_post.id
    user_id         UUID FK → user.id
    reaction_type   TEXT
```

### Discussion System Rules

1. No global forum — every thread must be tied to content
2. No free-floating comments
3. Moderation must occur at the thread level
4. Threads must support analytics via `event_log` using canonical identifiers `(program_id, module_id, episode_id, user_id)`
5. All discussion events must be append-only in `event_log`

### Rationale

Generic discussion forums lead to orphaned conversations, moderation chaos, impossible analytics, impossible AI summarization, and low engagement quality.

Content-anchored discussions enable:
- Episode-specific discussions
- Module-level insights
- Instructor responses tied to lessons
- AI summarization of learning conversations
- Engagement analytics per episode/module

### CLAUD-TISTIC Validation (Phase 4 Gate)

When the discussion system is implemented, @CLAUD-TISTIC must verify:

- Every thread has a content anchor (program_id required, module_id/episode_id optional)
- No global thread creation route exists
- Moderation scope remains bounded to thread level
- Analytics events reference canonical content identifiers
- No thread can be created without at least `program_id`

---

## Security Hardening Rules (Post-Phase 4 OWASP Audit)

### Rule: Event Log PII Safety (Step 6)

event_log payloads must NEVER contain PII.

**Allowed:** `program_id`, `module_id`, `episode_id`, `thread_id`, `post_id`
**Forbidden:** `email`, `name`, `post_body`

### Rule: AI Data Access (Step 7)

AI systems must NEVER query raw discussion tables (`content_thread`, `content_post`, `content_reaction`).

AI pipelines must use sanitized analytical views. Example view: `ai_discussion_summary_view`

**Allowed fields:** `thread_id`, `episode_id`, `reaction_counts`, `engagement_metrics`
**Forbidden:** Raw discussion text without explicit filtering.

### Rule: Canonical Content Graph (Step 8)

Every learning artifact must reference canonical identifiers:
- `program_id` (required)
- `module_id` (when applicable)
- `episode_id` (when applicable)

Applies to: transcripts, discussion posts, notes, operator commentary, AI insights, learning highlights.

### Rule: AI Insight Layer (Step 9)

AI insights are stored in separate tables and NEVER modify learning data:
- `ai_insight` — the insight content
- `ai_insight_source` — what content generated the insight
- `ai_insight_reference` — canonical content identifiers

Insights reference program/module/episode IDs but write to their own namespace.

### Rule: Discussion Scale Protection (Steps 10-11)

- Thread ordering: `pinned DESC → helpful_reactions DESC → post_count DESC → created_at DESC`
- Thread stats cached in `thread_stats` table (not aggregated live)
- Stats updated asynchronously on post/reaction events
- Thread creation limited to 3 per episode per user per day
