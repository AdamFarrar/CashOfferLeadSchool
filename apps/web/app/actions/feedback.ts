"use server";

import {
    submitFeedback,
    recordPromptSeen,
    recordPromptDismissed,
    getFeedbackByUser,
    feedbackExistsForUser,
    getAllFeedback,
    reviewFeedback,
} from "@cocs/services";
import { getServerIdentity } from "./identity";

const MAX_BODY_LENGTH = 2000;
const MAX_NOTES_LENGTH = 1000;
const VALID_TYPES = ["general", "feature_request", "bug_report", "usability", "content"] as const;
const VALID_GROUPS = ["internal", "pilot_user", "admin"] as const;
const VALID_STATUSES = ["new", "reviewed", "actioned", "dismissed"] as const;

// --- Submit Feedback ---

interface SubmitFeedbackActionInput {
    stakeholderGroup: typeof VALID_GROUPS[number];
    type: typeof VALID_TYPES[number];
    context: string;
    body: string;
    rating?: number;
    promptSeenAt?: string; // ISO string from client
}

export async function submitFeedbackAction(input: SubmitFeedbackActionInput) {
    // Resolve identity server-side — never trust client
    const identity = await getServerIdentity();
    if (!identity || !identity.organizationId) {
        return { success: false, error: "Authentication required." };
    }

    // Validate required fields
    if (!input.body?.trim()) {
        return { success: false, error: "Feedback body is required." };
    }

    if (!input.context?.trim()) {
        return { success: false, error: "Feedback context is required." };
    }

    // Validate enums
    if (!VALID_TYPES.includes(input.type)) {
        return { success: false, error: "Invalid feedback type." };
    }

    if (!VALID_GROUPS.includes(input.stakeholderGroup)) {
        return { success: false, error: "Invalid stakeholder group." };
    }

    // Validate length
    if (input.body.length > MAX_BODY_LENGTH) {
        return { success: false, error: `Feedback must be under ${MAX_BODY_LENGTH} characters.` };
    }

    // Validate rating
    if (input.rating !== undefined && (input.rating < 1 || input.rating > 5)) {
        return { success: false, error: "Rating must be between 1 and 5." };
    }

    try {
        const entry = await submitFeedback({
            userId: identity.userId,
            organizationId: identity.organizationId,
            stakeholderGroup: input.stakeholderGroup,
            type: input.type,
            context: input.context.trim(),
            body: input.body.trim(),
            rating: input.rating,
            promptSeenAt: input.promptSeenAt ? new Date(input.promptSeenAt) : undefined,
        });

        return { success: true, id: entry.id };
    } catch (err) {
        console.error("Feedback submission error:", err);
        return { success: false, error: "Failed to submit feedback. Please try again." };
    }
}

// --- Prompt Lifecycle ---

export async function recordPromptSeenAction(feedbackId: string) {
    if (!feedbackId) return;

    // Require authenticated session
    const identity = await getServerIdentity();
    if (!identity) return;

    // Verify ownership: feedbackId must belong to calling user
    const owns = await feedbackExistsForUser(feedbackId, identity.userId);
    if (!owns) return;

    try {
        await recordPromptSeen(feedbackId);
    } catch (err) {
        console.error("Record prompt seen error:", err);
    }
}

export async function recordPromptDismissedAction(feedbackId: string) {
    if (!feedbackId) return;

    // Require authenticated session
    const identity = await getServerIdentity();
    if (!identity) return;

    // Verify ownership: feedbackId must belong to calling user
    const owns = await feedbackExistsForUser(feedbackId, identity.userId);
    if (!owns) return;

    try {
        await recordPromptDismissed(feedbackId);
    } catch (err) {
        console.error("Record prompt dismissed error:", err);
    }
}

// --- User Feedback (own feedback only) ---

export async function getUserFeedbackAction() {
    const identity = await getServerIdentity();
    if (!identity || !identity.organizationId) return [];

    try {
        return await getFeedbackByUser(identity.userId, identity.organizationId);
    } catch (err) {
        console.error("Get user feedback error:", err);
        return [];
    }
}

// --- Admin-only actions ---

interface AdminReviewInput {
    feedbackId: string;
    status: typeof VALID_STATUSES[number];
    adminNotes?: string;
}

export async function reviewFeedbackAction(input: AdminReviewInput) {
    const identity = await getServerIdentity();
    if (!identity) {
        return { success: false, error: "Authentication required." };
    }

    if (!["owner", "admin"].includes(identity.role)) {
        return { success: false, error: "Insufficient permissions." };
    }

    if (!input.feedbackId) {
        return { success: false, error: "Missing required fields." };
    }

    if (!VALID_STATUSES.includes(input.status)) {
        return { success: false, error: "Invalid status." };
    }

    if (input.adminNotes && input.adminNotes.length > MAX_NOTES_LENGTH) {
        return { success: false, error: `Notes must be under ${MAX_NOTES_LENGTH} characters.` };
    }

    try {
        await reviewFeedback({
            feedbackId: input.feedbackId,
            reviewerId: identity.userId,
            status: input.status,
            adminNotes: input.adminNotes?.trim(),
        });

        return { success: true };
    } catch (err) {
        console.error("Review feedback error:", err);
        return { success: false, error: "Failed to update feedback." };
    }
}

interface AdminListInput {
    stakeholderGroup?: typeof VALID_GROUPS[number];
    status?: typeof VALID_STATUSES[number];
    context?: string;
}

export async function getAdminFeedbackAction(input: AdminListInput) {
    const identity = await getServerIdentity();
    if (!identity) return [];

    if (!["owner", "admin"].includes(identity.role)) {
        return [];
    }

    try {
        return await getAllFeedback({
            stakeholderGroup: input.stakeholderGroup,
            status: input.status,
            context: input.context,
        });
    } catch (err) {
        console.error("Get admin feedback error:", err);
        return [];
    }
}
