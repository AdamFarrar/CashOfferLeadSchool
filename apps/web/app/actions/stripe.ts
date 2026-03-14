"use server";

// =============================================================================
// Stripe Server Actions
// =============================================================================
// createCheckoutSessionAction — creates Stripe Checkout, returns URL
// getEnrollmentStatusAction — returns current user's enrollment
// adminEnrollUserAction — manually enroll a user (admin-only)
// adminListEnrollmentsAction — list all enrollments (admin-only)
// =============================================================================

import { getServerIdentity } from "./identity";
import { requireAdmin } from "./guards";
import {
    isUserEnrolled,
    getEnrollmentByUserId,
    listEnrollments,
    adminCreateManualEnrollment,
} from "@cols/services";

// ── Create Checkout Session ──

export async function createCheckoutSessionAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, error: "Not authenticated." };

    // Check if already enrolled
    const enrolled = await isUserEnrolled(identity.userId);
    if (enrolled) {
        return { success: false, error: "Already enrolled.", enrolled: true };
    }

    // Dynamic import to avoid loading Stripe at module level
    const { getStripeClient, STRIPE_CONFIG } = await import("@/app/lib/stripe");
    const stripe = getStripeClient();

    if (!STRIPE_CONFIG.priceId) {
        return { success: false, error: "Payment configuration not ready." };
    }

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
            {
                price: STRIPE_CONFIG.priceId,
                quantity: 1,
            },
        ],
        success_url: STRIPE_CONFIG.successUrl,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        client_reference_id: identity.userId,
        customer_email: undefined, // Stripe will ask for email
        metadata: {
            userId: identity.userId,
            organizationId: identity.organizationId,
        },
    });

    return { success: true, url: session.url };
}

// ── Get Enrollment Status ──

export async function getEnrollmentStatusAction() {
    const identity = await getServerIdentity();
    if (!identity) return { success: false, enrolled: false, enrollment: null };

    const enrollment = await getEnrollmentByUserId(identity.userId);

    return {
        success: true,
        enrolled: enrollment?.status === "active",
        enrollment: enrollment
            ? {
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                amountCents: enrollment.amountCents,
                currency: enrollment.currency,
            }
            : null,
    };
}

// ── Admin: Manual Enroll ──

export async function adminEnrollUserAction(userId: string) {
    await requireAdmin();

    if (!userId?.trim()) return { success: false, error: "User ID required." };

    try {
        await adminCreateManualEnrollment(userId.trim());
        return { success: true };
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

// ── Admin: List Enrollments ──

export async function adminListEnrollmentsAction(page: number = 1) {
    await requireAdmin();
    const result = await listEnrollments(page, 50);
    return { success: true, ...result };
}
