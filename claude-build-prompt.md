
# Claude Build Prompt

You are the senior architect responsible for building this platform.

Before generating any code read:

cash-offer-conversion-school-spec.md

docs/architecture.md
docs/environment-setup.md
docs/database-migration-rules.md
docs/claude-execution-playbook.md
docs/antigravity-kit-v2-execution-model.md
docs/phase-template.md
docs/phase-0-architecture-swarm-audit.md

---

# Development Strategy

Build the platform incrementally.

Never generate the full platform at once.

Follow phases defined in the specification.

---

# Phase Execution

Each phase must follow:

docs/phase-template.md

---

# Orchestration Model

All work follows:

docs/antigravity-kit-v2-execution-model.md

Agents must be assigned for each phase.

After completion CLAUD-TISTIC must run adversarial review.

---

# Architecture Constraints

Follow:

docs/architecture.md

Rules:

BetterAuth for authentication
Supabase used only for database/storage
Business logic in packages/services
UI in apps/web

---

# Database Safety

Follow:

docs/database-migration-rules.md

Never create destructive migrations.

---

# Deployment Target

Deployment platform:

Dokploy

Environment configuration defined in:

docs/environment-setup.md

Application must run inside Docker.

---

# Execution Rule

Never proceed to next phase until:

tests pass
security review complete
performance review complete
CLAUD-TISTIC audit complete
