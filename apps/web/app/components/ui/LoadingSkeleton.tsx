"use client";

// =============================================================================
// LoadingSkeleton — Phase H (Product Hardening)
// =============================================================================
// Layout-matched animated placeholder for async-loading sections.
// Prevents layout shift and communicates loading state visually.
// =============================================================================

interface LoadingSkeletonProps {
    variant?: "hero" | "list" | "card" | "text";
    count?: number;
}

const shimmerStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--bg-secondary) 25%, rgba(255,255,255,0.04) 50%, var(--bg-secondary) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s ease-in-out infinite",
    borderRadius: "var(--radius-sm)",
};

function SkeletonBlock({ width, height }: { width: string; height: string }) {
    return <div style={{ ...shimmerStyle, width, height }} />;
}

export function LoadingSkeleton({ variant = "text", count = 1 }: LoadingSkeletonProps) {
    if (variant === "hero") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <SkeletonBlock width="40%" height="0.7rem" />
                <SkeletonBlock width="70%" height="1.5rem" />
                <SkeletonBlock width="50%" height="0.8rem" />
                <SkeletonBlock width="100%" height="0.5rem" />
                <SkeletonBlock width="8rem" height="2.5rem" />
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            </div>
        );
    }

    if (variant === "card") {
        return (
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
                gap: "0.75rem",
            }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} style={{
                        padding: "1rem",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    }}>
                        <SkeletonBlock width="60%" height="0.8rem" />
                        <SkeletonBlock width="100%" height="0.6rem" />
                        <SkeletonBlock width="80%" height="0.6rem" />
                    </div>
                ))}
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            </div>
        );
    }

    if (variant === "list") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                    }}>
                        <SkeletonBlock width="2rem" height="2rem" />
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            <SkeletonBlock width="60%" height="0.7rem" />
                            <SkeletonBlock width="40%" height="0.5rem" />
                        </div>
                    </div>
                ))}
                <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            </div>
        );
    }

    // Default: text lines
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonBlock key={i} width={`${70 + Math.random() * 30}%`} height="0.7rem" />
            ))}
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        </div>
    );
}
