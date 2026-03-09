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
    "/api/auth",
    "/api/health",
];

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Check for BetterAuth session cookie (presence only — see docs above)
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
