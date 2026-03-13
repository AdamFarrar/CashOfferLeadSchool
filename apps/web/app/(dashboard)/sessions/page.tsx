"use client";

// =============================================================================
// User Sessions Page — Phase 9
// =============================================================================
// Shows upcoming sessions with countdown timers and past session recordings.
// Meeting links are revealed only when session is live or within 15 min.
// =============================================================================

import { useState, useEffect } from "react";
import {
    getUpcomingSessionsAction,
    getPastSessionsAction,
} from "@/app/actions/live-sessions";

interface Session {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: Date;
    durationMinutes: number;
    status: string;
    meetingUrl: string | null;
    recordingUrl: string | null;
    hostName: string;
}

export default function SessionsPage() {
    const [upcoming, setUpcoming] = useState<Session[]>([]);
    const [past, setPast] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        Promise.all([
            getUpcomingSessionsAction(),
            getPastSessionsAction(),
        ]).then(([u, p]) => {
            setUpcoming(u.sessions as Session[]);
            setPast(p.sessions as Session[]);
            setLoading(false);
        });
    }, []);

    // Update countdown every minute
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(interval);
    }, []);

    function formatCountdown(scheduledAt: Date): string {
        const diff = new Date(scheduledAt).getTime() - now;
        if (diff <= 0) return "Live Now";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    function isJoinable(s: Session): boolean {
        if (s.status === "live") return true;
        const diff = new Date(s.scheduledAt).getTime() - now;
        return diff > 0 && diff < 15 * 60 * 1000; // within 15 min
    }

    if (loading) {
        return (
            <div style={{ padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Loading sessions...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "48rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                📹 Live Sessions
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
                Join weekly coaching calls and access past recordings.
            </p>

            {/* Upcoming */}
            <div style={{ marginBottom: "2.5rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                    Upcoming
                </div>

                {upcoming.length === 0 ? (
                    <div style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-subtle)",
                    }}>
                        No upcoming sessions scheduled. Check back soon!
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {upcoming.map((s) => {
                            const countdown = formatCountdown(s.scheduledAt);
                            const joinable = isJoinable(s);
                            const isLive = s.status === "live" || countdown === "Live Now";

                            return (
                                <div key={s.id} style={{
                                    padding: "1.25rem",
                                    borderRadius: "var(--radius-md)",
                                    border: isLive ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--border-subtle)",
                                    background: isLive ? "rgba(34,197,94,0.03)" : undefined,
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                                <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>{s.title}</span>
                                                {isLive && (
                                                    <span style={{
                                                        fontSize: "0.6rem",
                                                        fontWeight: 700,
                                                        padding: "0.15rem 0.5rem",
                                                        borderRadius: "2rem",
                                                        background: "rgba(34,197,94,0.15)",
                                                        color: "#22c55e",
                                                        animation: "pulse 2s ease-in-out infinite",
                                                    }}>
                                                        🔴 LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                                                {new Date(s.scheduledAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at{" "}
                                                {new Date(s.scheduledAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {s.durationMinutes} min · Hosted by {s.hostName}
                                            </div>
                                            {s.description && (
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                                                    {s.description}
                                                </p>
                                            )}
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "1rem" }}>
                                            {!isLive && (
                                                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                                                    {countdown}
                                                </div>
                                            )}
                                            {joinable && s.meetingUrl && (
                                                <a
                                                    href={s.meetingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "0.5rem 1rem",
                                                        fontSize: "0.8rem",
                                                        fontWeight: 700,
                                                        color: "#fff",
                                                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                                        borderRadius: "var(--radius-sm)",
                                                        textDecoration: "none",
                                                        boxShadow: "0 2px 12px rgba(34,197,94,0.3)",
                                                    }}
                                                >
                                                    Join Now →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Past Sessions / Recordings */}
            {past.length > 0 && (
                <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                        Past Recordings
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {past.map((s) => (
                            <div key={s.id} style={{
                                padding: "0.75rem 1rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-subtle)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{s.title}</div>
                                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                        {new Date(s.scheduledAt).toLocaleDateString()} · {s.durationMinutes}min
                                    </div>
                                </div>
                                {s.recordingUrl ? (
                                    <a
                                        href={s.recordingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: "#a855f7",
                                            textDecoration: "none",
                                        }}
                                    >
                                        ▶ Watch Recording
                                    </a>
                                ) : (
                                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                        Recording coming soon
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
