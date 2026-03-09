import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// =============================================================================
// Drizzle Client — Lazy Initialization
// =============================================================================
// Client is lazily initialized to avoid throwing during Next.js build
// when SUPABASE_DB_URL is not available (build-time vs runtime).
// =============================================================================

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createClient() {
    const connectionString = process.env.SUPABASE_DB_URL;

    if (!connectionString) {
        throw new Error(
            "SUPABASE_DB_URL environment variable is required. " +
            "Set it in .env.local for local development."
        );
    }

    const client = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
    });

    return drizzle(client, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
    get(_target, prop) {
        if (!_db) {
            _db = createClient();
        }
        return (_db as any)[prop];
    },
});

export type Database = typeof db;
