# Cash Offer Conversion School  
## Platform Architecture & Build Specification  
### Claude Implementation Blueprint

---

## 1. Platform Mental Model

You are **not building**:

- a webinar library  
- a Facebook community  
- a simple course platform  
- a generic lead portal  

You are building:

> **A structured operator training ecosystem that turns education into implementation — and implementation into revenue.**

The platform functions as:

```
Authority Engine
+
Operator Training
+
Conversion Diagnostics
+
Lead Client Acquisition
```

Education builds trust.

Trust enables conversion.

---

## 2. Strategic Objective

If executed properly this platform becomes:

• the authority center for cash-offer conversion  
• the trust engine for Realty.com  
• a self-converting sales magnet  

The desired lifecycle:

```
Agent joins program
↓
Learns conversion system
↓
Implements process
↓
Recognizes seller lead opportunity
↓
Activates seller leads
↓
Purchases leads
```

Audits serve as a **conversion accelerator**, not the only revenue path.

---

## 3. Success Metrics (First 6 Months)

| Metric | Target |
|------|------|
| Registrations | 10,000 |
| Audits per month | 60 |
| Audit show rate | 90% |
| Lead clients converted | 180 |
| Revenue | $2M ARR |

Stakeholder priority ranking:

1. Content engagement  
2. Audit bookings  
3. Revenue from lead clients  
4. Qualified team signups  
5. Brand authority  
6. Partner visibility  

---

## 4. Ideal Operator Profile

| Attribute | Requirement |
|---|---|
| **Team size** | >3 |
| **Listings per month** | >2 |
| **Experience** | >3 years |
| **Marketing budget** | $1k+/month |

Not a good fit:

• no marketing budget  
• referral-only business model  
• part-time agents  

---

## 5. Operator Segmentation

The platform must classify users into **three tiers**.

### Tier 1 — Enterprise Operators

Characteristics:

• 10+ agents  
• strong listing volume  

Treatment:

• immediate sales outreach  
• strong audit promotion  

### Tier 2 — Core ICP

Characteristics:

• 3–9 agents  
• active listing operators  

Treatment:

• audit encouraged  
• implementation education  

### Tier 3 — Nurture

Characteristics:

• below ICP threshold  

Treatment:

• education only  
• low-touch communication  

---

## 6. Funnel Architecture

```
Landing Page
↓
Registration
↓
Qualification Survey
↓
Dynamic Confirmation Page
↓
Academy Dashboard
↓
Education + Implementation
↓
Conversion
```

### Conversion Paths

#### Sales Assisted

```
Audit request
↓
Audit call
↓
Lead client conversion
```

#### Self-Serve (future state)

```
Education mastery
↓
Confidence in system
↓
Self-serve lead activation
↓
Lead purchase
```

---

## 7. Platform Surfaces

### Marketing Site

Routes:

```
/
Landing

/register
Registration

/qualify
Qualification survey

/confirm
Dynamic confirmation

/book-audit
Audit booking
```

Goals:

• capture operators  
• collect segmentation data  
• generate audit requests  

### Authenticated Academy App

Routes:

```
/app
Dashboard

/app/curriculum
Modules + episodes

/app/episodes/[slug]
Episode page

/app/downloads
Assets

/app/notes
User notes

/app/discussion
Community discussion

/app/profile
User profile
```

---

## 8. Dashboard Experience

The dashboard must answer:

> **What should I do next?**

Key elements:

• season progress tracker  
• next session countdown  
• this week's focus  
• asset download shortcut  
• join live session  
• audit CTA  

---

## 9. Curriculum Structure

```
Season
↓
Modules
↓
Episodes
```

Season example:

```
Season 1
Cash Offer Conversion School
```

Modules:

1. Convert for the Appointment  
2. Win the Appointment  
3. Offer Mechanics  
4. Post-Sprint Nurture  

---

## 10. Episode Page Layout

Each episode includes:

• replay video  
• downloadable asset  
• implementation checklist  
• key takeaways  
• discussion thread  

---

## 11. Engagement Layer

### Notes

Users can:

• write notes  
• timestamp notes  
• export notes  

Phase 1 implementation:

Plain markdown notes only.

### Discussion

Categories:

• Speed-to-Lead  
• Appointment Booking  
• Objections  
• Presentation  
• Follow-Up  

Features:

• threads  
• replies  
• upvotes  

Moderation required.

---

## 12. Audit System

Audit lifecycle:

```
Requested
↓
Scheduled
↓
Completed
↓
Outcome recorded
```

Possible outcomes:

• converted to lead client  
• nurture  
• disqualified  
• no-show  

---

## 13. Technology Stack

### Frontend

```
Next.js (App Router)
TypeScript
Tailwind
shadcn/ui
```

### Backend

```
Supabase – primary data store (Postgres) and file storage.  
BetterAuth – handles authentication, session management and Single Sign‑On (SSO).  
RLS enforced via Supabase.  

### Instrumentation & Analytics

• **PostHog** – MIT‑licensed, self‑hostable product analytics with event tracking, funnels, user journeys and built‑in session recording【100216009149359†L36-L40】.  PostHog gives you full control over your data and includes feature flags and experimentation modules.  
• **GrowthBook** – MIT‑licensed A/B testing and feature‑flagging platform【100216009149359†L41-L43】.  GrowthBook connects to your own data warehouse to evaluate experiments and supports gradual rollouts, server‑side and client‑side experiments.  
• **OpenTelemetry** – instrument the front‑end, backend and admin panel to capture audit logs and user activity; OpenTelemetry collects logs alongside metrics and traces and exports them to your data warehouse【34792228021956†L144-L159】【462794382823329†L185-L238】.  
• **rrweb (optional)** – a small, MIT‑licensed library that records and replays user interactions【598930464032839†L8-L30】.  Although PostHog uses rrweb under the hood for session recording, you may integrate rrweb directly if you need custom replay features or finer‑grained control.
```

BetterAuth replaces Supabase Auth and includes the **SSO** plugin.  This lets you register a single SSO provider that accepts **multiple domains** by listing them as a comma‑separated string (e.g. `"company.com,company.org"【278654247742290†L1562-L1564】`).  When registering a provider you can also link it to a specific organization by specifying an `organizationId`【423141375372142†L984-L1007】.  Using a central IdP this way means users who sign in on one domain can log into another domain without re‑entering credentials.

### Video hosting

```
Mux
Vimeo
Wistia
```

### Content Authoring

We will use **BlockNote**, a block‑based rich text editor with a modern UI that organises documents into blocks and can be easily extended【183947854348396†L64-L79】【183947854348396†L98-L103】.  BlockNote will power curriculum authoring and user notes.  To enable AI‑assisted editing and summarisation, integrate the **blocknote‑ai** plugin by Adam Farrar【940809091487705†L79-L99】.


### Deployment

```
Dokploy
containerized Next.js
```

### Integration & API

The platform will expose a suite of APIs so third‑party systems (e.g. HubSpot, Salesforce) can programmatically read and write data.  We will:

• **REST + GraphQL** – Design RESTful endpoints for common use cases (e.g. retrieving users, progress, assets) with optional GraphQL endpoints for composite queries.  Following OpenAPI standards ensures the API design starts from consumer needs and allows future evolution without breaking existing clients【298314091644907†L191-L213】.  
• **OpenAPI documentation** – Maintain an OpenAPI (Swagger) specification describing all endpoints, request/response schemas, versioning and error codes.  Publish this documentation to a developer portal and update it alongside the code【298314091644907†L274-L285】.  
• **API scopes** – Provide separate scopes for open (public) APIs, partner APIs (for trusted integrations) and internal APIs【298314091644907†L236-L247】.  Partner APIs enforce stricter authentication and authorization.  
• **Webhooks & 2‑way integration** – Implement webhook endpoints to notify CRMs or marketing platforms when key events occur (e.g. new registration, audit completion, lead conversion).  Create callbacks to receive updates from CRMs (e.g. status changes in HubSpot or Salesforce) and update the platform accordingly.  

• **API gateway** – Use an API gateway (e.g. Kong or Nginx) as a single entry point to handle authentication, rate limiting, versioning and routing【298314091644907†L339-L344】.  

• **Nango (integration platform)** – Rather than building custom connectors for every third‑party service, adopt **Nango**, an open‑source integration platform.  Nango provides pre‑built authentication for over **700 external APIs** and handles token refresh, rate limiting and retries【507943725799105†L152-L182】.  It supports **2‑way syncs**, allowing you to both read and write data to CRMs like HubSpot and Salesforce, and exposes a **universal webhook interface** so you can receive events from any provider【507943725799105†L152-L171】.  Integration logic is written as **TypeScript functions** in your own codebase and deployed to Nango’s runtime, giving you full control while leveraging its scaling and observability features【507943725799105†L46-L73】.  Using Nango removes the need to build your own iPaaS and ensures future integrations can be added quickly.

This integration layer allows the platform to connect with external systems without exposing internal implementation details and supports both synchronous API calls and asynchronous event flows.


---

## 14. Deployment Constraints

Deployment must support **Dokploy**.

Requirements:

• containerized Next.js app  
• environment variables managed in Dokploy  
• staging and production environments  

Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
APP_BASE_URL
```

---

## 15. Repository Structure and Code Organization

To support scalability, maintainability and eventual mobile expansion, organize the codebase as a **monorepo** rather than a single-app repository. A recommended top‑level structure, inspired by the Next.js + Supabase SaaS kit documentation, looks like this:

```
├── apps/
│   ├── web/          # main Next.js application
│   ├── mobile/       # (future) React Native/Expo application
│   └── e2e/          # end‑to‑end tests
├── packages/
│   ├── ui/           # shared UI components (shadcn design system)
│   ├── services/     # business logic / service layer (curriculum, audit, coaching, payments)
│   ├── db/           # database client and types
│   ├── auth/         # BetterAuth integration, exposing server and client hooks
│   ├── api/          # API layer (REST/GraphQL handlers, OpenAPI docs, schema definitions and tests)
│   ├── integrations/ # Nango integration functions (HubSpot, Salesforce, etc.) and wrappers around Nango’s SDK
│   └── ...           # other shared packages (email, notifications, workflows, etc.)
└── turbo.json        # Turborepo configuration
```

The MakerKit guide on Next.js + Supabase notes that the `apps/web` folder contains the main Next.js app, while the `packages` directory holds reusable modules like feature packages, UI components, and the `supabase` package【830981217919336†L83-L107】. Inside `apps/web`, follow Next.js App Router conventions with directories such as `app/` for routes, `components/` for app‑specific components, `lib/` for utilities and helpers, and `supabase/` for database migrations and seed data【830981217919336†L111-L131】. When you introduce a mobile client later, create an `apps/mobile` folder (using React Native/Expo) that consumes the same shared packages.

Place **all business logic in the `services` packages** so both web and mobile clients can reuse it.  Authentication and SSO logic lives in the `auth` package and wraps BetterAuth’s server/client APIs, exposing hooks to the rest of the app.  This structure makes it easy to add packages for UI, database clients, notifications and more, and scales well when you add additional applications【830981217919336†L83-L107】.

---

## 16. Database Schema

Supabase Postgres is the system of record.

### Profiles

Table:

```
profiles
```

Fields:

- user_id  
- full_name  
- role  
- team_size  
- market  
- monthly_listings  
- cash_offer_experience  
- bottleneck  
- goal_90_days  
- onboarding_completed  

### Organizations (future team mode)

```
organizations
organization_members
```

### Curriculum

```
seasons
modules
episodes
episode_assets
```

### Engagement

```
user_episode_progress
user_asset_events
notes
```

### Community

```
discussion_categories
discussion_threads
discussion_replies
discussion_votes
```

### Sales

```
audit_requests
lead_client_conversions
```

### Coaching & Membership (future)

```
events
event_registrations
courses
course_sessions
course_enrollments
membership_plans
memberships
payments
```

These tables support a future **coaching module** with event listings and registration, structured/cohort‑based courses, and membership plans.  Adding them early to the schema avoids a large refactor when you introduce coaching and paid programs later.

### Observability & AI Insights

```
audit_events
ai_recommendations
experiments
```

The `audit_events` table records every user and admin action (e.g. page views, clicks, note edits, downloads, form interactions) with metadata such as user ID, session ID, event type, experiment variation and timestamp.  Logs are instrumented using OpenTelemetry so they can be correlated with metrics and traces【34792228021956†L144-L159】【462794382823329†L185-L238】.  

The `ai_recommendations` table stores insights and suggestions generated by AI models (e.g. “Next episode to watch,” “User is at risk of churn,” “Form drop‑off detected”).  Each record stores the subject user/org ID, recommendation type, suggestion text and timestamps for creation and delivery.  

The `experiments` table tracks A/B tests and feature flags created via GrowthBook or PostHog.  It stores the experiment name, variants, targeted user segments and timestamps, enabling you to correlate experiment participation with outcomes.

---

## 17. Roles & Permissions

To control access across the academy, audit tooling and coaching modules you will implement a **hybrid role‑based and attribute‑based access control** system.  This avoids reinventing your own permissions layer and combines the strengths of BetterAuth, Supabase and a type‑safe permissions library.

### Role‑based access control (RBAC) via BetterAuth

BetterAuth’s **Organisation** plugin lets you manage multi‑user structures (teams, companies, projects), assign roles and implement permissions【487209235418262†L55-L59】.  Each role is defined as a set of authorized actions on specific entities using `createAccessControl`【487209235418262†L188-L203】; users can hold multiple roles and you can customize the organisation model (e.g. renaming tables or adding fields).  For example, define roles such as:

- **owner** – can create organisations, invite members, manage billing, update curriculum and moderate discussions.
- **admin** – can manage members, upload assets and respond to audit requests.
- **member** – can view content, download assets and participate in discussions.

When customizing roles, reintroduce base actions to keep built‑in methods functional【487209235418262†L188-L203】.  Associate roles with organisations using BetterAuth’s database schema and expose them via the `auth` package in your repo.

### Attribute‑based access control (ABAC) via Supabase RLS

While RBAC controls high‑level capabilities, you must restrict access to individual rows of data.  Supabase’s **row‑level security (RLS)** lets you write policies that depend on record attributes like `user_id` or `organization_id`.  For every table (e.g. notes, progress, audit_requests) create an RLS policy that allows users to read/write rows only if they belong to the same organisation or are the record owner.  This enforces ABAC at the database layer.

### Type‑safe permission checks in code with Permix

For runtime checks in your API handlers and React components, use **Permix**—a lightweight, framework‑agnostic permissions manager written in TypeScript.  Permix provides full type safety and lets you define resources and actions once and enforce them in both client and server code【681781303859150†L10-L13】【681781303859150†L56-L64】.  You create a single permissions schema using `createPermix` and define templates for each role; dynamic predicate functions can restrict actions to specific conditions (e.g. only authors can edit their own notes)【50398391727916†L122-L212】.  Hydrate Permix with the roles from BetterAuth and evaluate permissions before rendering buttons, calling APIs or mutating data.

### Hybrid approach rationale

A blended RBAC + ABAC model gives you leak‑tight protection for sensitive records while allowing dynamic behaviour【130974992039380†L724-L732】.  BetterAuth handles high‑level role assignments, Supabase RLS enforces row‑level isolation and Permix provides type‑safe permission checks in your application.  This layered approach avoids reinventing a permissions system while keeping your codebase extensible and secure.

## 18. Multi‑Tenant Support

Although the initial product is an internal tool, we intend the architecture to be **multi‑tenant** from day one so we can sell the platform to other coaches or brokerages in the future.  Each tenant corresponds to an **organization** in the database.  To support multi‑tenancy:

• **Tenant isolation via organizations** – Use the `organizations` and `organization_members` tables to represent each coach/company.  Every record in tables like `notes`, `user_episode_progress`, `events` or `membership_plans` should include an `organization_id` foreign key.  RLS policies must enforce that users can only see rows for their organization.  The Makerkit RLS patterns highlight the need for team‑based access with role hierarchies and granular permissions in multi‑tenant SaaS apps【429002196865065†L377-L381】.

• **Per‑tenant configuration** – Create a `tenant_settings` table storing custom domain, branding (logo, colors), feature toggles and plan limits.  When a tenant signs up, they can configure their brand and map a custom subdomain (e.g. `academy.coachname.com`).  BetterAuth’s SSO plugin supports registering multiple domains separated by commas【278654247742290†L1562-L1564】, which makes it easy to add new customer domains.

• **White‑labelled front end** – Expose a branding service in the `ui` package to load tenant‑specific logos, color schemes and messaging.  The marketing site can serve tenant‑specific landing pages using Next.js dynamic routes (e.g. `/[tenant]/landing`).

• **Tenant‑scoped roles & permissions** – Roles (`owner`, `admin`, `member`) and permissions are always scoped to the organization.  BetterAuth’s access control plugin lets you assign roles per tenant; Permix can include the `organization_id` in its dynamic predicates.  Supabase RLS policies should reference both `auth.uid()` and `organization_id` for every table.

• **Billing and usage limits** – If you choose to offer the platform as a SaaS product, use the `membership_plans` and `payments` tables to track subscription plans per tenant.  Stripe’s customer and subscription IDs should be stored alongside `organization_id` to enforce plan limits (e.g. number of members, number of courses, API rate limits).

• **Self‑service onboarding** – Provide endpoints and a UI flow for new coaches to create an organization, configure SSO domains and pay for their subscription.  Use Nango to set up CRM integrations per tenant by storing the tenant’s Nango connection IDs and syncing data accordingly.

By treating the organization as the tenant and enforcing `organization_id` checks everywhere, you can safely onboard external customers without code changes.  Adding a new tenant becomes a matter of creating a new record in `organizations` and applying your existing RLS policies.  This multi‑tenant architecture will be part of the core design rather than an afterthought.

## 18. Security Requirements

Minimum security requirements:

• RLS on every table.
• Signed URLs for asset downloads.
• **BetterAuth domain verification** – verify ownership of each domain used for SSO so that new SSO providers are only trusted once the domain is validated【278654247742290†L1562-L1564】.  
• Session cookies scoped correctly (per‑domain), no cross‑site cookie sharing.  
• Service role never exposed to the client.
• Rate limiting login + posting.  
• CAPTCHA for registration.

When using the SSO plugin, each provider’s domain must be verified through BetterAuth’s domain verification process.  Users signing in via one domain should not automatically grant access to other unverified domains.

---

## 19. Development Phases
### Phase 0 — Observability & Analytics Setup

Before building any user‑facing features, create the foundation for instrumentation and experimentation:

• **Create new tables**: `audit_events`, `ai_recommendations` and `experiments` (see the **Observability & AI Insights** section of the schema).  
• **Set up OpenTelemetry** in both the marketing site and the academy app to emit audit events and traces.  Use consistent event names and include metadata such as user ID, session ID, page URL, event type and experiment variation.  
• **Deploy PostHog** on your infrastructure and integrate it with the front‑end to track page views, form interactions, funnels and session recordings.  Instrument the backend to send custom events for API actions.  
• **Deploy GrowthBook** and connect it to your database or warehouse.  Define a few feature flags (e.g. marketing CTA variants) and run a smoke test to ensure the end‑to‑end experiment flow works.  
• **(Optional) Integrate rrweb** if you need custom session replay logic beyond PostHog’s default capabilities.  rrweb can be configured to record only specific pages or form interactions.  

This preparatory phase ensures that metrics, logs and experiments are captured from day one, allowing you to evaluate funnel performance and user behaviour as soon as the site goes live.


### Phase 1 — Funnel (Tenant‑Aware)

Build:

• landing page  
• registration  
• qualification survey  
• confirmation page  
• audit request capture  

Goal:

Validate demand and segmentation.

*Tenant considerations*: even at this early stage, the funnel must be multi‑tenant aware.  Registration flows should capture the intended organization (either an existing tenant or a new one) and associate new users with an `organization_id`.  The `tenant_settings` record for your own internal organization should be seeded in the database so the system can display branded colours and domains from day one.  This ensures that when you eventually onboard external customers, the funnel can accommodate tenant‑specific domains and branding without refactoring.

### Phase 2 — Academy MVP (Multi‑Tenant Foundations)

Build:

• auth system  
• onboarding profile capture  
• curriculum structure  
• episode pages  
• asset downloads  
• progress tracking  

• **Roles & permissions foundation** – Define your core roles (owner, admin, member) and authorized actions using BetterAuth’s organisation plugin and `createAccessControl`.  Add `created_by` or `organization_id` columns where necessary and write Supabase RLS policies to restrict rows based on those attributes.  Integrate Permix into your service layer and UI components; define a permissions schema for resources (episodes, notes, assets, discussions, etc.) and templates for each role.  Use Permix to gate API routes and UI buttons.

• **Multi‑tenant scaffolding** – Implement the `tenant_settings` table and build a configuration UI for admins to set branding (logo, colours) and custom domains.  Update your routing and service layer to resolve the current tenant from the domain or path prefix and inject the tenant context into all database queries.  Ensure that all newly created records (notes, progress, events, membership plans) automatically include the correct `organization_id`.  Seed a default tenant for internal use and write RLS policies that enforce tenant isolation on every table.

### Phase 3 — Engagement

Add:

• notes system  
• discussion system  

### Phase 4 — Conversion Infrastructure

Add:

• readiness signals  
• sales routing  
• conversion analytics  
• **API endpoints & docs** – Build the first version of the public and partner API.  Implement RESTful endpoints (and optional GraphQL) for reading program data (users, profiles, curriculum, progress, audits) and writing updates.  Generate OpenAPI documentation and publish it.  Add webhook endpoints for CRM integrations (e.g. HubSpot, Salesforce) to receive and send data.

• **Integrate Nango** – Stand up a Nango instance (cloud or self‑hosted) and configure connectors for the initial set of CRMs (e.g. HubSpot and Salesforce).  Write integration functions using Nango’s TypeScript API to sync contacts, leads and engagement data into your database and push updates back to the CRMs.  Configure Nango’s universal webhook handler to receive events (e.g. deal closed, contact updated) and route them into your application.

### Phase 5 — Coaching & Membership Expansion

Add:

• **Event listings & registrations** – allow coaches to publish live event details (title, description, date/time, external streaming link) and allow members to RSVP.  These events will not require built‑in streaming but will integrate with third‑party services like Zoom or StreamYard for actual live sessions.
• **Structured/cohort courses** – extend the curriculum engine to support scheduled releases and cohorts for coaching content.
• **Membership plans & paywall integration** – integrate a payment provider (e.g. Stripe) to manage subscription plans, handle paid memberships, and gate access to coaching content.  This can remain disabled until the business is ready to charge.
• **Separate coaching community spaces** – add categories/spaces for coaching discussions that are private to paid members or coaching clients.
• **Workflow automations** – add onboarding and reminder workflows (e.g. email sequences) using an automation service to keep coaching clients engaged.

Phase 5 builds upon the database tables defined in the **Coaching & Membership** section and should not begin until core engagement and conversion infrastructure have proved value.  By planning these features now, you ensure the underlying schema and service layer can support them later without a large refactor.

---

## 20. KPI Dashboard

Track weekly.

### Acquisition

• landing → registration conversion  
• total registrations  
• qualification completion  

### Engagement

• weekly active users  
• episode completion  
• asset downloads  
• notes created  

### Sales

• audits requested  
• audit show rate  
• lead client conversions  
• ARR  

---

## 21. Build Guardrails

Do NOT build in Phase 1:

• leaderboards  
• script builder  
• cadence tracker  
• team analytics  
• complex readiness scoring  

Engineering standards:

• TypeScript strict mode  
• ESLint  
• CI checks  

Security rule:

All `/app/*` routes must require authentication.

---

## 22. Future Expansion

Potential features (beyond Phase 5):

• **Script builder** – tool to generate pitch scripts based on segments.  
• **Follow-up cadence tracker** – manage sequences for prospect follow-up.  
• **Advanced team mode** – deeper analytics for organizations, leaderboards, and coaching leader assignments.  
• **Certification programs** – award certificates for completing advanced tracks.  
• **Lead marketplace** – expanded marketplace for different lead types.  
• **Event & coaching enhancements** – advanced scheduling features (recurring sessions, time‑zone handling) and built‑in webinar replays.  
• **Membership & paywall expansions** – dynamic pricing, upsells and add‑ons.  
• **SCIM and enterprise identity management** – support the BetterAuth SCIM plugin to sync users from identity providers across multiple domains【667654147907043†L54-L57】.  

These features should only be implemented after the core engagement, conversion and coaching modules are proven.  Planning them now informs the data model and service layer but they are not part of the initial build.

---

## 23. Claude Implementation Prompt

Use this when uploading the spec.

```
You are a senior full-stack architect.

You are given a full platform specification document.

Your task:

1. Analyze the specification.
2. Design the system architecture.
3. Generate Supabase SQL migrations with RLS.
4. Generate the Next.js project structure.
5. Create milestone-based development instructions.
6. Ensure deployment via Dokploy (containerized Next.js).

Constraints:

• Next.js App Router
• Supabase Auth + Postgres + Storage
• TypeScript strict mode
• Server-side auth protection
• RLS enforced everywhere
• minimal dependencies
• no Vercel-specific infrastructure

Deliver:

1. database schema SQL
2. folder structure
3. API route plan
4. auth flow
5. milestone build plan
6. security implementation
7. Dokploy deployment configuration

Use the specification as the source of truth.

If anything is ambiguous, propose the simplest maintainable solution.
```

---
