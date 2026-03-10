// =============================================================================
// Shared UI Components — Design System Enforced Cards
// =============================================================================
// These components eliminate repeated glass-card patterns and enforce
// consistent padding, spacing, and typography hierarchy.
// =============================================================================

import Link from "next/link";

// ── ProgramCard ──
// Used for dashboard quick actions and program navigation
interface ProgramCardProps {
    href: string;
    icon: string;
    title: string;
    subtitle: string;
    className?: string;
}

export function ProgramCard({ href, icon, title, subtitle, className = "" }: ProgramCardProps) {
    return (
        <Link
            href={href}
            className={`glass-card p-6 no-underline text-inherit text-center hover:border-[var(--brand-orange)]/30 transition-colors ${className}`}
        >
            <div className="text-2xl mb-3">{icon}</div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs text-[color:var(--text-muted)] mt-1">{subtitle}</div>
        </Link>
    );
}

// ── FeatureCard ──
// Used for landing page feature/deliverable sections
interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    centered?: boolean;
    className?: string;
}

export function FeatureCard({ icon, title, description, centered = false, className = "" }: FeatureCardProps) {
    return (
        <div className={`glass-card p-6 ${centered ? "text-center" : ""} ${className}`}>
            {centered ? (
                <div className="text-3xl mb-3">{icon}</div>
            ) : (
                <div className="icon-box mb-4">{icon}</div>
            )}
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-[color:var(--text-secondary)] text-sm leading-relaxed">
                {description}
            </p>
        </div>
    );
}

// ── EpisodeCard ──
// Used for episode listings in the episode library
interface EpisodeCardProps {
    episodeNumber: number;
    title: string;
    guest: string;
    actions?: boolean;
}

export function EpisodeCard({ episodeNumber, title, guest, actions = true }: EpisodeCardProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-start gap-4">
                <div className="icon-box shrink-0 text-sm">🎬</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="badge text-xs shrink-0">Ep {episodeNumber}</span>
                        <h3 className="font-semibold text-sm truncate">{title}</h3>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)]">{guest}</p>
                </div>
                {actions && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            className="btn-ghost text-xs py-1.5 px-3 opacity-50 cursor-not-allowed"
                            disabled
                            title="Coming soon"
                        >
                            📥 Download
                        </button>
                        <button
                            className="btn-ghost text-xs py-1.5 px-3 opacity-50 cursor-not-allowed"
                            disabled
                            title="Coming soon"
                        >
                            ▶ Replay
                        </button>
                        <button
                            className="btn-ghost text-xs py-1.5 px-3 opacity-50 cursor-not-allowed"
                            disabled
                            title="Coming soon"
                        >
                            📝 Notes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── ModuleHeader ──
// Consistent module section header for episode grouping
interface ModuleHeaderProps {
    moduleNumber: number;
    title: string;
    weeks: string;
}

export function ModuleHeader({ moduleNumber, title, weeks }: ModuleHeaderProps) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className="text-[color:var(--brand-orange)] font-bold text-sm">
                MODULE {moduleNumber}
            </span>
            <span className="text-[color:var(--text-muted)] text-sm">—</span>
            <span className="font-semibold text-sm">{title}</span>
            <span className="text-xs text-[color:var(--text-muted)] ml-auto">{weeks}</span>
        </div>
    );
}

// ── SectionHeader ──
// Consistent section headers for dashboard pages
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            {subtitle && (
                <p className="text-[color:var(--text-secondary)] text-sm">{subtitle}</p>
            )}
        </div>
    );
}

// ── ComingSoonCard ──
// Placeholder for features not yet available
interface ComingSoonCardProps {
    icon: string;
    title: string;
    description: string;
}

export function ComingSoonCard({ icon, title, description }: ComingSoonCardProps) {
    return (
        <div className="glass-card p-6 text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-[color:var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed">
                {description}
            </p>
        </div>
    );
}
