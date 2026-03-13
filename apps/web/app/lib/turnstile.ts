// =============================================================================
// Turnstile Configuration
// =============================================================================
// The site key is a PUBLIC key (visible in page source) — safe to hardcode.
// The secret key remains server-side only via env var.
// =============================================================================

export const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACqMkN_v-yukuw--";
