#!/usr/bin/env bash
# =============================================================================
# Schema Drift Check
# =============================================================================
# Compares the Drizzle schema files against the live Supabase database schema
# to detect drift between code and production.
#
# Usage:
#   ./scripts/check-schema-drift.sh
#
# Requires: DATABASE_URL in .env, npx drizzle-kit available
# =============================================================================

set -euo pipefail

echo "🔍 Checking for schema drift between Drizzle files and database..."

# Generate current Drizzle schema as SQL
DRIZZLE_SQL=$(npx drizzle-kit generate --dialect=postgresql --schema=packages/database/src/schema --out=/tmp/drift-check 2>/dev/null)

if [ -d "/tmp/drift-check" ]; then
    MIGRATION_COUNT=$(find /tmp/drift-check -name "*.sql" -type f | wc -l | tr -d ' ')

    if [ "$MIGRATION_COUNT" -eq "0" ]; then
        echo "✅ No schema drift detected — Drizzle schema matches database."
    else
        echo "⚠️  Schema drift detected! $MIGRATION_COUNT pending migration(s):"
        echo ""
        for f in /tmp/drift-check/*.sql; do
            echo "--- $(basename "$f") ---"
            cat "$f"
            echo ""
        done
        echo "Run 'npx drizzle-kit push' to apply, or review the migrations above."
    fi

    rm -rf /tmp/drift-check
else
    echo "❌ Failed to generate drift check. Ensure DATABASE_URL is set."
    exit 1
fi
