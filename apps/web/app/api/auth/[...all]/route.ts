import { auth } from "@cols/auth/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitKey, RATE_LIMITS } from "@cols/services";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// =============================================================================
// Rate-Limited Auth Routes
// =============================================================================
// Login and registration are rate-limited by IP.
// Other auth routes (session, verify, etc.) pass through unrestricted.
// =============================================================================

const RATE_LIMITED_PATHS: Record<string, typeof RATE_LIMITS.login> = {
    "/api/auth/sign-up/email": RATE_LIMITS.registration,
    "/api/auth/sign-in/email": RATE_LIMITS.login,
};

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}

export async function GET(request: NextRequest) {
    return auth.handler(request);
}

export async function POST(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const limitConfig = RATE_LIMITED_PATHS[pathname];

    if (limitConfig) {
        const ip = getClientIp(request);
        const rl = checkRateLimit(
            rateLimitKey(limitConfig.name, ip),
            limitConfig,
        );

        if (!rl.allowed) {
            // Generic error — do not leak whether the account exists
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
                    },
                },
            );
        }
    }

    return auth.handler(request);
}
