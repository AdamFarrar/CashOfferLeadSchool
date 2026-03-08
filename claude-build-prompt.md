You are a senior full-stack architect.

I am providing a platform specification document.

Your task:

1. Analyze the specification.
2. Design the system architecture, using a monorepo layout with `apps/web` and shared `packages` as described in the spec.
3. Generate Supabase SQL migrations with RLS.
4. Generate the Next.js project structure.
5. Create milestone-based development instructions.
6. Ensure deployment via Dokploy (containerized Next.js).
7. Incorporate instrumentation and analytics.  Use OpenTelemetry across the front‑end, backend and admin panel to emit audit logs and traces; integrate PostHog for product analytics and session recording; integrate GrowthBook for A/B testing and feature flags; add SQL tables for audit events, AI recommendations and experiments as defined in the specification.
8. Incorporate third‑party integrations.  Use **Nango** as the integration platform to connect to external CRMs such as HubSpot and Salesforce.  Generate integration functions in the `packages/integrations` package and configure Nango connectors, including 2‑way sync and webhooks, as described in the specification.  Do not build bespoke integration logic when Nango provides ready‑made connectors.
 9. Incorporate roles and permissions.  Define role‑based permissions using BetterAuth’s organisation plugin (e.g. owner, admin, member) and map actions to roles using `createAccessControl`.  Implement row‑level security policies on the Supabase tables to restrict data by owner or organization.  Use **Permix** for type‑safe permission checks in your service layer and UI.  Define a unified permission schema (resources and actions) and role templates, then gate API routes and client actions via Permix.

10. Incorporate **multi‑tenant architecture**.  Treat the organisation as the tenant and design the database schema, API routes and service layer accordingly.  Implement a `tenant_settings` table for custom branding, domain, feature toggles and plan limits.  Seed a default tenant for internal use.  Ensure all application routes resolve the current tenant from the domain or URL path, inject the tenant context into queries and automatically assign `organization_id` when creating new records.  Write Supabase RLS policies that enforce tenant isolation across every table, and use Permix to enforce tenant‑scoped permissions in the application layer.  Prepare the codebase so additional tenants can be onboarded without further refactoring.

Constraints:

• Next.js App Router
• Supabase Postgres + Storage for data
• BetterAuth for authentication and Single Sign‑On (SSO) across multiple domains
• TypeScript strict mode
• Server-side auth protection
• RLS enforced everywhere
• Instrumentation & analytics integrated – use OpenTelemetry for event logging, PostHog for product analytics and session recording, and GrowthBook for experiments and feature flags
• Integration layer – use Nango to manage external API connectors (HubSpot, Salesforce, etc.).  Write integration functions in TypeScript and deploy them to Nango rather than building custom integration logic.
• Roles & permissions – implement a hybrid RBAC + ABAC model.  Use BetterAuth’s organisation plugin for RBAC roles and authorized actions; enforce data isolation via Supabase RLS (ABAC); adopt Permix as a type‑safe permission manager to evaluate permissions in client and server code.
• minimal dependencies
• no Vercel-specific infrastructure

Deliver:

1. database schema SQL
2. folder structure (monorepo)
3. API route plan
4. auth flow
5. milestone build plan
6. security implementation
7. Dokploy deployment configuration

Use the specification as the source of truth.

Note: When designing the auth flow, incorporate BetterAuth’s SSO plugin.  Ensure you register SSO providers with multiple domains (comma‑separated domain field) and link them to organizations where necessary【278654247742290†L1562-L1564】【423141375372142†L984-L1007】.

If anything is ambiguous, propose the simplest maintainable solution.
