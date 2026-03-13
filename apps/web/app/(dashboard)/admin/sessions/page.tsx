"use client";

// =============================================================================
// Admin Live Sessions — Phase 9
// =============================================================================

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@cocs/auth/client";
import {
    adminListSessionsAction,
    adminCreateSessionAction,
    adminUpdateSessionAction,
    adminDeleteSessionAction,
} from "@/app/actions/live-sessions";

interface SessionRow {
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

export default function AdminSessionsPage() {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<SessionRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        scheduledAt: "",
        durationMinutes: 60,
        meetingUrl: "",
        hostName: "Adam Farrar",
    });

    const load = useCallback(async () => {
        setLoading(true);
        const result = await adminListSessionsAction(1);
        if (result.success) {
            setSessions(result.sessions as SessionRow[]);
            setTotal(result.total);
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        if (!form.title.trim() || !form.scheduledAt) {
            setStatus("❌ Title and date are required.");
            return;
        }
        setStatus("Creating...");
        const result = await adminCreateSessionAction({
            title: form.title,
            description: form.description || undefined,
            scheduledAt: form.scheduledAt,
            durationMinutes: form.durationMinutes,
            meetingUrl: form.meetingUrl || undefined,
            hostName: form.hostName,
        });
        if (result.success) {
            setStatus("✅ Session created.");
            setForm({ title: "", description: "", scheduledAt: "", durationMinutes: 60, meetingUrl: "", hostName: "Adam Farrar" });
            setShowCreate(false);
            load();
        } else {
            setStatus(`❌ ${result.error}`);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await adminUpdateSessionAction(id, { status: newStatus as Parameters<typeof adminUpdateSessionAction>[1]["status"] });
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this session?")) return;
        await adminDeleteSessionAction(id);
        load();
    };

    if (!session) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: "56rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 700 }}>📹 Live Sessions</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="episode-action-btn"
                    style={{ fontSize: "0.75rem" }}
                >
                    + Schedule Session
                </button>
            </div>

            {status && (
                <div style={{
                    padding: "0.6rem 1rem",
                    marginBottom: "1rem",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${status.startsWith("✅") ? "rgba(34,197,94,0.3)" : "var(--border-subtle)"}`,
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                }}>
                    {status}
                </div>
            )}

            {/* Create Form */}
            {showCreate && (
                <div style={{
                    padding: "1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    marginBottom: "1.5rem",
                }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "1rem" }}>
                        📅 Schedule New Session
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={labelStyle}>Title</label>
                            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Weekly Q&A Coaching Call" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Date & Time</label>
                            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Duration (min)</label>
                            <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Meeting URL</label>
                            <input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} placeholder="https://meet.google.com/... or Zoom link" style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Host</label>
                            <input value={form.hostName} onChange={(e) => setForm({ ...form, hostName: e.target.value })} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                            <label style={labelStyle}>Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will be covered..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                        <button onClick={handleCreate} className="episode-action-btn" style={{ fontSize: "0.75rem" }}>Create Session</button>
                        <button onClick={() => setShowCreate(false)} style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem", background: "transparent", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", color: "var(--text-muted)", cursor: "pointer" }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Sessions List */}
            <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                All Sessions ({total})
            </div>

            {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading...</div>
            ) : sessions.length === 0 ? (
                <div style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                }}>
                    No sessions scheduled yet. Click "Schedule Session" to create one.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {sessions.map((s) => (
                        <div key={s.id} style={{
                            padding: "1rem 1.25rem",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-subtle)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{s.title}</span>
                                        <span style={{
                                            fontSize: "0.6rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            padding: "0.1rem 0.5rem",
                                            borderRadius: "2rem",
                                            background: s.status === "scheduled" ? "rgba(59,130,246,0.12)" : s.status === "live" ? "rgba(34,197,94,0.12)" : s.status === "completed" ? "rgba(168,85,247,0.12)" : "rgba(239,68,68,0.12)",
                                            color: s.status === "scheduled" ? "#3b82f6" : s.status === "live" ? "#22c55e" : s.status === "completed" ? "#a855f7" : "#ef4444",
                                        }}>
                                            {s.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        {new Date(s.scheduledAt).toLocaleString()} · {s.durationMinutes}min · {s.hostName}
                                    </div>
                                    {s.meetingUrl && (
                                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                            🔗 {s.meetingUrl.slice(0, 50)}{s.meetingUrl.length > 50 ? "..." : ""}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {s.status === "scheduled" && (
                                        <button onClick={() => handleStatusChange(s.id, "live")} style={smallBtnStyle("#22c55e")}>Go Live</button>
                                    )}
                                    {s.status === "live" && (
                                        <button onClick={() => handleStatusChange(s.id, "completed")} style={smallBtnStyle("#a855f7")}>End</button>
                                    )}
                                    <button onClick={() => handleDelete(s.id)} style={smallBtnStyle("#ef4444", true)}>🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    color: "var(--text-muted)",
    letterSpacing: "0.05em",
    marginBottom: "0.25rem",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: "0.8rem",
};

function smallBtnStyle(color: string, ghost = false): React.CSSProperties {
    return {
        fontSize: "0.65rem",
        fontWeight: 700,
        padding: "0.2rem 0.5rem",
        borderRadius: "var(--radius-sm)",
        border: `1px solid ${color}33`,
        background: ghost ? "transparent" : `${color}1a`,
        color,
        cursor: "pointer",
    };
}
