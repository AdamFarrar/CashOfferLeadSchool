// =============================================================================
// Enrollment Service
// =============================================================================
// Handles enrollment persistence and lookups.
// All DB operations for payment gating go through this service.
// =============================================================================

import { db } from "@cols/database";
import { enrollment } from "@cols/database/schema";
import { user } from "@cols/database/schema";
import { eq, desc, sql } from "drizzle-orm";

// ── Types ──

export type EnrollmentStatus = "active" | "past_due" | "cancelled" | "refunded";

export interface EnrollmentRecord {
    id: string;
    userId: string;
    status: string;
    stripeCustomerId: string | null;
    stripeCheckoutSessionId: string | null;
    stripePaymentIntentId: string | null;
    amountCents: number;
    currency: string;
    enrolledAt: Date;
    expiresAt: Date | null;
    createdAt: Date;
}

// ── Check Enrollment ──

export async function isUserEnrolled(userId: string): Promise<boolean> {
    const results = await db
        .select({ status: enrollment.status })
        .from(enrollment)
        .where(eq(enrollment.userId, userId))
        .limit(1);

    return results.length > 0 && results[0].status === "active";
}

// ── Get Enrollment ──

export async function getEnrollmentByUserId(userId: string): Promise<EnrollmentRecord | null> {
    const results = await db
        .select({
            id: enrollment.id,
            userId: enrollment.userId,
            status: enrollment.status,
            stripeCustomerId: enrollment.stripeCustomerId,
            stripeCheckoutSessionId: enrollment.stripeCheckoutSessionId,
            stripePaymentIntentId: enrollment.stripePaymentIntentId,
            amountCents: enrollment.amountCents,
            currency: enrollment.currency,
            enrolledAt: enrollment.enrolledAt,
            expiresAt: enrollment.expiresAt,
            createdAt: enrollment.createdAt,
        })
        .from(enrollment)
        .where(eq(enrollment.userId, userId))
        .limit(1);

    return results[0] ?? null;
}

// ── Create Enrollment ──

export async function createEnrollment(data: {
    userId: string;
    programId?: string;
    stripeCustomerId?: string;
    stripeCheckoutSessionId?: string;
    stripePaymentIntentId?: string;
    amountCents: number;
    currency?: string;
}): Promise<string> {
    const [result] = await db
        .insert(enrollment)
        .values({
            userId: data.userId,
            programId: data.programId ?? null,
            status: "active",
            stripeCustomerId: data.stripeCustomerId ?? null,
            stripeCheckoutSessionId: data.stripeCheckoutSessionId ?? null,
            stripePaymentIntentId: data.stripePaymentIntentId ?? null,
            amountCents: data.amountCents,
            currency: data.currency ?? "usd",
        })
        .onConflictDoUpdate({
            target: [enrollment.userId, enrollment.programId],
            set: {
                status: "active",
                stripeCustomerId: data.stripeCustomerId ?? null,
                stripeCheckoutSessionId: data.stripeCheckoutSessionId ?? null,
                stripePaymentIntentId: data.stripePaymentIntentId ?? null,
                amountCents: data.amountCents,
                updatedAt: new Date(),
            },
        })
        .returning({ id: enrollment.id });

    if (!result) throw new Error("Failed to create enrollment.");
    return result.id;
}

// ── Update Enrollment Status ──

export async function updateEnrollmentStatus(
    userId: string,
    status: EnrollmentStatus,
): Promise<boolean> {
    const result = await db
        .update(enrollment)
        .set({ status, updatedAt: new Date() })
        .where(eq(enrollment.userId, userId))
        .returning({ id: enrollment.id });

    return result.length > 0;
}

// ── Update by Stripe Payment Intent ──

export async function updateEnrollmentByPaymentIntent(
    paymentIntentId: string,
    status: EnrollmentStatus,
): Promise<boolean> {
    const result = await db
        .update(enrollment)
        .set({ status, updatedAt: new Date() })
        .where(eq(enrollment.stripePaymentIntentId, paymentIntentId))
        .returning({ id: enrollment.id });

    return result.length > 0;
}

// ── Admin: List Enrollments ──

export async function listEnrollments(page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;

    const [rows, countResult] = await Promise.all([
        db
            .select({
                id: enrollment.id,
                userId: enrollment.userId,
                status: enrollment.status,
                amountCents: enrollment.amountCents,
                currency: enrollment.currency,
                enrolledAt: enrollment.enrolledAt,
                stripeCustomerId: enrollment.stripeCustomerId,
                stripeCheckoutSessionId: enrollment.stripeCheckoutSessionId,
                userName: user.name,
                userEmail: user.email,
            })
            .from(enrollment)
            .innerJoin(user, eq(enrollment.userId, user.id))
            .orderBy(desc(enrollment.enrolledAt))
            .limit(limit)
            .offset(offset),
        db
            .select({ total: sql<number>`count(*)::int` })
            .from(enrollment),
    ]);

    return { enrollments: rows, total: countResult[0]?.total ?? 0, page, limit };
}

// ── Admin: Manual Enrollment (comp/test) ──

export async function adminCreateManualEnrollment(userId: string): Promise<string> {
    return createEnrollment({
        userId,
        amountCents: 0,
        stripeCustomerId: "manual",
        stripeCheckoutSessionId: "manual",
    });
}
