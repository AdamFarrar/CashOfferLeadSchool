// =============================================================================
// Shared UI Components — Design System Enforced Cards
// =============================================================================
// These components eliminate repeated patterns and enforce
// consistent padding, spacing, and typography hierarchy.
// =============================================================================
// =============================================================================

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
        <div style={{
            textAlign: "center",
            padding: "3rem 2rem",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
        }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>{icon}</div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{title}</h2>
            <p style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                maxWidth: "28rem",
                margin: "0 auto",
                lineHeight: 1.6,
            }}>
                {description}
            </p>
        </div>
    );
}

