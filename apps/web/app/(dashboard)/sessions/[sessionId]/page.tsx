"use client";

// =============================================================================
// Session Detail Page — Phase C
// =============================================================================

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    getSessionDetailAction,
    toggleRsvpAction,
} from "@/app/actions/live-sessions";

interface Host {
    id: string;
    name: string;
    headshotUrl: string | null;
    bio: string | null;
    role: string;
}

interface SessionDetail {
    id: string;
    title: string;
    description: string | null;
    scheduledAt: Date;
    durationMinutes: number;
    status: string;
    meetingUrl: string | null;
    recordingUrl: string | null;
    hostName: string;
    hosts: Host[];
    rsvpCount: number;
    userRsvp: boolean;
}

export default function SessionDetailPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const [session, setSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        getSessionDetailAction(sessionId).then((result) => {
            if (result.success && result.session) {
                setSession(result.session as SessionDetail);
            }
            setLoading(false);
        });
    }, [sessionId]);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(interval);
    }, []);

    async function handleRsvpToggle() {
        if (!session) return;
        setRsvpLoading(true);
        const result = await toggleRsvpAction(sessionId);
        if (result.success) {
            setSession({
                ...session,
                userRsvp: result.rsvpd,
                rsvpCount: session.rsvpCount + (result.rsvpd ? 1 : -1),
            });
        }
        setRsvpLoading(false);
    }

    if (loading) {
        return (
            <div style={{ padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Loading session...
            </div>
        );
    }

    if (!session) {
        return (
            <div style={{ padding: "2rem", textAlign: "center" }}>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    Session not found.
                </p>
                <Link href="/sessions" style={{ fontSize: "0.8rem", color: "var(--brand-orange)" }}>
                    ← Back to Sessions
                </Link>
            </div>
        );
    }

    const scheduledTime = new Date(session.scheduledAt).getTime();
    const diff = scheduledTime - now;
    const isUpcoming = session.status === "scheduled" && diff > 0;
    const isLive = session.status === "live" || (session.status === "scheduled" && diff <= 0 && diff > -session.durationMinutes * 60_000);
    const isCompleted = session.status === "completed";
    const isJoinable = (isLive || (isUpcoming && diff < 15 * 60_000)) && !!session.meetingUrl;

    // Countdown
    function formatCountdown(): string {
        if (diff <= 0) return "Live Now";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    const displayHosts = session.hosts.length > 0 ? session.hosts : [{ id: "fallback", name: session.hostName, headshotUrl: null, bio: null, role: "host" }];

    return (
        <div style={{ maxWidth: "48rem" }}>
            {/* Back link */}
            <Link
                href="/sessions"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    marginBottom: "1.25rem",
                }}
            >
                ← Sessions
            </Link>

            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>
                        {session.title}
                    </h1>
                    {isLive && (
                        <span style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: "2rem",
                            background: "rgba(34,197,94,0.15)",
                            color: "#22c55e",
                            animation: "pulse 2s ease-in-out infinite",
                        }}>
                            🔴 LIVE
                        </span>
                    )}
                    {isCompleted && (
                        <span style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.6rem",
                            borderRadius: "2rem",
                            background: "rgba(168,85,247,0.12)",
                            color: "#a855f7",
                        }}>
                            Completed
                        </span>
                    )}
                </div>

                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(session.scheduledAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                    })}
                    <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                        · {session.durationMinutes} min
                    </span>
                </div>

                {/* Countdown + Join + RSVP row */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    {isUpcoming && (
                        <div style={{
                            fontSize: "1.1rem",
                            fontWeight: 800,
                            color: "var(--text-primary)",
                        }}>
                            {formatCountdown()}
                        </div>
                    )}

                    {isJoinable && (
                        <a
                            href={session.meetingUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-block",
                                padding: "0.55rem 1.25rem",
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

                    {isUpcoming && (
                        <button
                            onClick={handleRsvpToggle}
                            disabled={rsvpLoading}
                            style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                borderRadius: "var(--radius-sm)",
                                border: session.userRsvp
                                    ? "1px solid rgba(34,197,94,0.3)"
                                    : "1px solid var(--border-subtle)",
                                background: session.userRsvp
                                    ? "rgba(34,197,94,0.08)"
                                    : "transparent",
                                color: session.userRsvp ? "#22c55e" : "var(--text-secondary)",
                                cursor: "pointer",
                                opacity: rsvpLoading ? 0.5 : 1,
                            }}
                        >
                            {session.userRsvp ? "✓ Attending" : "RSVP"}
                        </button>
                    )}

                    {session.rsvpCount > 0 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {session.rsvpCount} attending
                        </span>
                    )}
                </div>
            </div>

            {/* Recording (completed sessions) */}
            {isCompleted && session.recordingUrl && (
                <div style={{
                    marginBottom: "1.5rem",
                    padding: "1.5rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    background: "rgba(168,85,247,0.03)",
                }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "#a855f7", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                        ▶ Session Recording
                    </div>
                    <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-block",
                            padding: "0.55rem 1.25rem",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#fff",
                            background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                            borderRadius: "var(--radius-sm)",
                            textDecoration: "none",
                        }}
                    >
                        Watch Recording →
                    </a>
                </div>
            )}

            {/* Description */}
            {session.description && (
                <div style={{
                    marginBottom: "1.5rem",
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                        About This Session
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                        {session.description}
                    </p>
                </div>
            )}

            {/* Hosts */}
            <div style={{
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
            }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                    {displayHosts.length === 1 ? "Host" : "Hosts"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {displayHosts.map((host) => (
                        <div key={host.id} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                background: host.headshotUrl
                                    ? `url(${host.headshotUrl}) center/cover`
                                    : "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                fontWeight: 700,
                                flexShrink: 0,
                            }}>
                                {!host.headshotUrl && (host.name?.[0]?.toUpperCase() || "?")}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.15rem" }}>
                                    {host.name}
                                </div>
                                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize", marginBottom: host.bio ? "0.35rem" : 0 }}>
                                    {host.role}
                                </div>
                                {host.bio && (
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                                        {host.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
