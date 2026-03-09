import { describe, it, expect } from "vitest";

// =============================================================================
// Middleware Route Matching Tests
// =============================================================================
// Tests the route matching logic used by the auth middleware.
// We test the logic directly to avoid needing Next.js edge runtime.
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

function isStaticFile(pathname: string): boolean {
    return (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    );
}

describe("Middleware Route Matching", () => {
    describe("public routes", () => {
        it("allows landing page", () => {
            expect(isPublicRoute("/")).toBe(true);
        });

        it("allows login", () => {
            expect(isPublicRoute("/login")).toBe(true);
        });

        it("allows register", () => {
            expect(isPublicRoute("/register")).toBe(true);
        });

        it("allows verify-email", () => {
            expect(isPublicRoute("/verify-email")).toBe(true);
        });

        it("allows forgot-password", () => {
            expect(isPublicRoute("/forgot-password")).toBe(true);
        });

        it("allows auth API routes", () => {
            expect(isPublicRoute("/api/auth")).toBe(true);
            expect(isPublicRoute("/api/auth/callback")).toBe(true);
            expect(isPublicRoute("/api/auth/signin")).toBe(true);
        });

        it("allows health check", () => {
            expect(isPublicRoute("/api/health")).toBe(true);
        });
    });

    describe("protected routes", () => {
        it("protects dashboard", () => {
            expect(isPublicRoute("/dashboard")).toBe(false);
        });

        it("protects qualification form", () => {
            expect(isPublicRoute("/qualify")).toBe(false);
        });

        it("protects qualification confirmation", () => {
            expect(isPublicRoute("/qualify/confirmation")).toBe(false);
        });

        it("protects settings", () => {
            expect(isPublicRoute("/settings")).toBe(false);
        });

        it("protects arbitrary routes", () => {
            expect(isPublicRoute("/admin")).toBe(false);
            expect(isPublicRoute("/courses")).toBe(false);
        });
    });

    describe("static files", () => {
        it("allows Next.js internals", () => {
            expect(isStaticFile("/_next/static/chunk.js")).toBe(true);
            expect(isStaticFile("/_next/image?url=...")).toBe(true);
        });

        it("allows favicon", () => {
            expect(isStaticFile("/favicon.ico")).toBe(true);
        });

        it("allows files with extensions", () => {
            expect(isStaticFile("/robots.txt")).toBe(true);
            expect(isStaticFile("/sitemap.xml")).toBe(true);
        });

        it("does not match regular routes", () => {
            expect(isStaticFile("/dashboard")).toBe(false);
            expect(isStaticFile("/qualify")).toBe(false);
        });
    });
});
