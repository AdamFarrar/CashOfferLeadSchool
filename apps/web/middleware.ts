import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// Auth Middleware — Edge Runtime
// =============================================================================
// SECURITY BOUNDARY:
//
// This middleware runs on Cloudflare/Vercel edge and ONLY checks for the
// presence of a BetterAuth session cookie. It does NOT validate the cookie
// signature or session expiry — that is handled by:
//
//   1. auth.api.getSession() in Server Actions (authoritative)
//   2. auth.api.getActiveMember() for role-based access
//
// Purpose: UX routing only — redirect unauthenticated visitors to /login.
// An expired or forged cookie will pass this check but will be rejected by
// server actions, which are the actual security boundary.
//
// DO NOT add business logic or privilege checks here.
// =============================================================================

const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
    "/pricing",
    "/checkout",
    "/api/auth",
    "/api/health",
    "/api/stripe",
];

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

// ── Content Security Policy ──
const CSP_DIRECTIVES = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://us.i.posthog.com https://challenges.cloudflare.com https://static.cloudflareinsights.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://us.i.posthog.com https://api.stripe.com",
    "frame-src https://challenges.cloudflare.com https://checkout.stripe.com https://js.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join("; ");

function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set("Content-Security-Policy", CSP_DIRECTIVES);
    return response;
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (isPublicRoute(pathname)) {
        return addSecurityHeaders(NextResponse.next());
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return addSecurityHeaders(NextResponse.next());
    }

    // Check for BetterAuth session cookie (presence only — see docs above)
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        const redirect = NextResponse.redirect(loginUrl);
        return addSecurityHeaders(redirect);
    }

    return addSecurityHeaders(NextResponse.next());
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
