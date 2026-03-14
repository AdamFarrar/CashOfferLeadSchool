import { db } from "@cols/database/client";
import { feedbackEntry } from "@cols/database/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { emitDomainEvent, DOMAIN_EVENTS } from "@cols/events";

// =============================================================================
// Feedback Service — Phase 1.5A
// =============================================================================
// Business logic for stakeholder feedback collection, prompt lifecycle
// tracking, and admin review workflows.
// =============================================================================

type StakeholderGroup = "internal" | "pilot_user" | "admin";
type FeedbackType = "general" | "feature_request" | "bug_report" | "usability" | "content";
type FeedbackStatus = "new" | "reviewed" | "actioned" | "dismissed";

interface SubmitFeedbackInput {
    userId: string;
    organizationId: string;
    stakeholderGroup: StakeholderGroup;
    type: FeedbackType;
    context: string;
    body: string;
    rating?: number;
    metadata?: Record<string, unknown>;
    promptSeenAt?: Date;
}

interface ReviewFeedbackInput {
    feedbackId: string;
    reviewerId: string;
    status: FeedbackStatus;
    adminNotes?: string;
}

// --- Submit ---

export async function submitFeedback(input: SubmitFeedbackInput) {
    const now = new Date();

    const [entry] = await db
        .insert(feedbackEntry)
        .values({
            userId: input.userId,
            organizationId: input.organizationId,
            stakeholderGroup: input.stakeholderGroup,
            type: input.type,
            context: input.context,
            body: input.body,
            rating: input.rating ?? null,
            metadata: input.metadata ?? {},
            promptSeenAt: input.promptSeenAt ?? null,
            submittedAt: now,
        })
        .returning({ id: feedbackEntry.id });

    // Emit domain event for automation pipeline
    try {
        await emitDomainEvent({
            eventKey: DOMAIN_EVENTS.FEEDBACK_SUBMITTED,
            payload: {
                type: input.type,
                context: input.context,
                stakeholderGroup: input.stakeholderGroup,
                rating: input.rating ?? null,
            },
            actor: { type: "user", id: input.userId },
            subject: { type: "user", id: input.userId },
            organizationId: input.organizationId,
        });
    } catch {
        // Non-blocking
    }

    return entry;
}

// --- Prompt Lifecycle ---

export async function recordPromptSeen(feedbackId: string) {
    await db
        .update(feedbackEntry)
        .set({
            promptSeenAt: new Date(),
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(feedbackEntry.id, feedbackId),
                isNull(feedbackEntry.promptSeenAt)
            )
        );
}

export async function recordPromptDismissed(feedbackId: string) {
    await db
        .update(feedbackEntry)
        .set({
            dismissedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(feedbackEntry.id, feedbackId));
}

// --- Read ---

export async function getFeedbackByUser(userId: string, organizationId: string) {
    return db
        .select()
        .from(feedbackEntry)
        .where(
            and(
                eq(feedbackEntry.userId, userId),
                eq(feedbackEntry.organizationId, organizationId)
            )
        )
        .orderBy(desc(feedbackEntry.createdAt));
}

/**
 * Efficient ownership check — returns true if the feedback entry
 * belongs to the given user. Uses a targeted query instead of
 * fetching all feedback entries (O(1) vs O(n)).
 */
export async function feedbackExistsForUser(feedbackId: string, userId: string): Promise<boolean> {
    const result = await db
        .select({ id: feedbackEntry.id })
        .from(feedbackEntry)
        .where(
            and(
                eq(feedbackEntry.id, feedbackId),
                eq(feedbackEntry.userId, userId),
            )
        )
        .limit(1);
    return result.length > 0;
}

export async function getAllFeedback(filters?: {
    stakeholderGroup?: StakeholderGroup;
    status?: FeedbackStatus;
    context?: string;
}) {
    const conditions = [];

    if (filters?.stakeholderGroup) {
        conditions.push(eq(feedbackEntry.stakeholderGroup, filters.stakeholderGroup));
    }

    if (filters?.status) {
        conditions.push(eq(feedbackEntry.status, filters.status));
    }

    if (filters?.context) {
        conditions.push(eq(feedbackEntry.context, filters.context));
    }

    let query = db.select().from(feedbackEntry).$dynamic();

    if (conditions.length > 0) {
        query = query.where(and(...conditions));
    }

    return query.orderBy(desc(feedbackEntry.createdAt));
}

// --- Admin Review ---

export async function reviewFeedback(input: ReviewFeedbackInput) {
    await db
        .update(feedbackEntry)
        .set({
            status: input.status,
            reviewedBy: input.reviewerId,
            reviewedAt: new Date(),
            adminNotes: input.adminNotes ?? null,
            updatedAt: new Date(),
        })
        .where(eq(feedbackEntry.id, input.feedbackId));
}
