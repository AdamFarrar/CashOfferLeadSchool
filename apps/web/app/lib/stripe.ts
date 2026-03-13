// =============================================================================
// Stripe Client — Phase 7
// =============================================================================
// Lazy-initialized Stripe singleton. Never instantiated until first call.
// Configuration loaded from environment variables.
// =============================================================================

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
    if (!_stripe) {
        const secretKey = process.env.STRIPE_SECRET_KEY;
        if (!secretKey) {
            throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
        }
        _stripe = new Stripe(secretKey, {
            apiVersion: "2026-02-25.clover",
            typescript: true,
        });
    }
    return _stripe;
}

// ── Configuration ──

export const STRIPE_CONFIG = {
    priceId: process.env.STRIPE_PRICE_ID || "",
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
} as const;
