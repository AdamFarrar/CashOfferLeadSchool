// =============================================================================
// Enrollment Schema — Phase 7
// =============================================================================
// Tracks user enrollment status tied to Stripe payments.
// One enrollment per user (unique constraint on user_id).
// =============================================================================

import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    index,
} from "drizzle-orm/pg-core";

// ── Enrollment ──

export const enrollment = pgTable("enrollment", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    // 'active' | 'past_due' | 'cancelled' | 'refunded'
    stripeCustomerId: text("stripe_customer_id"),
    stripeCheckoutSessionId: text("stripe_checkout_session_id"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    index("idx_enrollment_user_id").on(t.userId),
    index("idx_enrollment_status").on(t.status),
    index("idx_enrollment_stripe_customer").on(t.stripeCustomerId),
]);
