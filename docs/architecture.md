
# Platform Architecture

Core Stack

Frontend
Next.js
TypeScript
Tailwind
shadcn/ui

Backend
Supabase Postgres
Supabase Storage
BetterAuth

Deployment
Dokploy
Docker

Analytics
PostHog
GrowthBook
OpenTelemetry

---

# Authentication

BetterAuth handles authentication.

Supabase Auth must not be used.

Architecture:

Next.js
BetterAuth
Supabase Postgres
