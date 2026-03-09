"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@cocs/analytics";
import { FunnelLandingViewed } from "@cocs/analytics/event-contracts";

// =============================================================================
// AnalyticsProvider — D4
// =============================================================================
// Wraps the app to handle:
// 1. PostHog lazy initialization (via first track() call)
// 2. Page-view tracking
// 3. Route change detection
//
// PostHog is NOT loaded until the first track() call fires.
// This component triggers the initial page view event.
// =============================================================================

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const prevPathname = useRef<string | null>(null);

    useEffect(() => {
        // Skip duplicate fires on same path
        if (pathname === prevPathname.current) return;
        prevPathname.current = pathname;

        // Fire landing page view for the root path
        if (pathname === "/") {
            track(FunnelLandingViewed, {});
        }

        // PostHog automatic pageview is disabled; we track via events
        // Page-specific events are fired by their respective pages
    }, [pathname]);

    return <>{children}</>;
}
