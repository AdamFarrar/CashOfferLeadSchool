"use client";

// =============================================================================
// TrackedCta — Client component for CTA click tracking
// =============================================================================
// Wraps a Next.js Link to fire funnel.cta.clicked on click.
// Used on server-rendered pages where inline onClick is not available.
// =============================================================================

import Link from "next/link";
import { track } from "@cocs/analytics";
import { FunnelCtaClicked } from "@cocs/analytics/event-contracts";

interface TrackedCtaProps {
    href: string;
    ctaId: string;
    ctaText: string;
    section: string;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

export function TrackedCta({
    href,
    ctaId,
    ctaText,
    section,
    className,
    style,
    children,
}: TrackedCtaProps) {
    return (
        <Link
            href={href}
            className={className}
            style={style}
            onClick={() => {
                track(FunnelCtaClicked, { cta_id: ctaId, cta_text: ctaText, section });
            }}
        >
            {children}
        </Link>
    );
}
