"use client";

// =============================================================================
// Breadcrumbs
// =============================================================================
// Reusable breadcrumb navigation component.
// Owner: @frontend-specialist | Reviewer: @ui-specialist, @design-system-enforcer
// =============================================================================

import Link from "next/link";

interface Crumb {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    crumbs: Crumb[];
}

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
    if (crumbs.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="breadcrumbs">
            <ol className="breadcrumbs-list">
                {crumbs.map((crumb, i) => {
                    const isLast = i === crumbs.length - 1;
                    return (
                        <li key={i} className="breadcrumbs-item">
                            {!isLast && crumb.href ? (
                                <Link href={crumb.href} className="breadcrumbs-link">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span
                                    className="breadcrumbs-current"
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {crumb.label}
                                </span>
                            )}
                            {!isLast && (
                                <span className="breadcrumbs-separator" aria-hidden="true">›</span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
