
# Database Migration Rules

Migrations must be:

incremental
reversible
non destructive

Forbidden operations:

drop tables
truncate tables
drop columns containing data

Destructive operations require manual approval.

---

All major tables must include:

organization_id

RLS enforces tenant isolation.
