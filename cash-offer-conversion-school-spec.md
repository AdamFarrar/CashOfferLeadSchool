
# Cash Offer Conversion School Platform Specification

This document defines the product and technical blueprint for the Cash Offer Conversion School platform.

This specification describes WHAT we are building.

Execution rules and development process are defined in:

docs/architecture.md
docs/environment-setup.md
docs/database-migration-rules.md
docs/claude-execution-playbook.md
docs/antigravity-kit-v2-execution-model.md
docs/phase-template.md
docs/phase-0-architecture-swarm-audit.md

---

# Product Goal

The platform trains and qualifies operators to run a successful cash offer lead generation and conversion business.

Core goals:

1. Education
2. Qualification
3. Conversion to service clients

---

# System Modules

The system contains five major components.

1. Conversion Funnel
2. Academy
3. Engagement Layer
4. Conversion Intelligence
5. Coaching Platform

---

# Phase Overview

Phase 1 — Conversion Funnel

Features:

Landing page
Registration
BetterAuth authentication
Qualification form
Confirmation page

---

Phase 2 — Academy

Dashboard
Course modules
Episodes
Downloads
Progress tracking

Content system:

BlockNote
blocknote-ai plugin

Future extensions:

quiz blocks
course gating

---

Phase 3 — Engagement

Notes
Discussion threads

---

Phase 4 — Conversion Intelligence

Audit system
Readiness signals
CRM integrations

Integration layer:

Nango

---

Phase 5 — Coaching Platform

Events
Webinars
Memberships
Notifications
Quizzes

Live session integrations:

Jitsi
BigBlueButton

---

# Multi Tenant Architecture

Organizations represent tenants.

Every major table must include:

organization_id

Tenant isolation enforced using Supabase RLS.

---

# Authentication

Authentication uses BetterAuth.

Supabase Auth must NOT be used.

Supabase responsibilities:

database
file storage
row level security

---

# Analytics

Behavior tracking via:

PostHog
GrowthBook
OpenTelemetry

Used for:

conversion optimization
AI insights
engagement analytics

---

# Performance Targets

Page load target:

<1.5 seconds

Support:

SSR
Edge caching

---

# Security

The system must support:

audit logs
behavior tracking
permissions

Permission model:

RBAC + ABAC hybrid

---

# Development Process

Development must follow the Antigravity Kit V2 orchestration model.

See:

docs/antigravity-kit-v2-execution-model.md
