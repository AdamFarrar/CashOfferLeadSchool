// =============================================================================
// Stripe Webhook Handler — Phase 7
// =============================================================================
// POST /api/stripe/webhook
// Handles checkout.session.completed and charge.refunded events.
// Verifies webhook signature before processing.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    // Dynamic import to avoid loading Stripe at edge
    const { getStripeClient } = await import("@/app/lib/stripe");
    const stripe = getStripeClient();

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // ── Handle Events ──

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.client_reference_id || session.metadata?.userId;

            if (!userId) {
                console.error("[Stripe Webhook] No userId in checkout session:", session.id);
                break;
            }

            const { createEnrollment } = await import("@cocs/services");

            await createEnrollment({
                userId,
                stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.toString() ?? undefined,
                stripeCheckoutSessionId: session.id,
                stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
                amountCents: session.amount_total ?? 0,
                currency: session.currency ?? "usd",
            });

            // Emit domain event for automation (welcome email, etc.)
            const { emitDomainEvent, DOMAIN_EVENTS } = await import("@cocs/events");
            await emitDomainEvent({
                eventKey: DOMAIN_EVENTS.ENROLLMENT_COMPLETED,
                actor: { type: "system", id: "stripe-webhook" },
                subject: { type: "enrollment", id: userId },
                payload: {
                    userId,
                    email: session.customer_details?.email ?? "",
                    user_name: session.customer_details?.name ?? "",
                    amountCents: session.amount_total ?? 0,
                },
            });

            console.log("[Stripe Webhook] Enrollment created for user:", userId);
            break;
        }

        case "charge.refunded": {
            const charge = event.data.object;
            const paymentIntent = typeof charge.payment_intent === "string" ? charge.payment_intent : null;

            if (paymentIntent) {
                const { updateEnrollmentByPaymentIntent } = await import("@cocs/services");
                await updateEnrollmentByPaymentIntent(paymentIntent, "refunded");
                console.log("[Stripe Webhook] Enrollment refunded for PI:", paymentIntent);
            }
            break;
        }

        default:
            // Unhandled event type — that's fine
            break;
    }

    return NextResponse.json({ received: true });
}
