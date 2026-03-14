"use client";

// =============================================================================
// Settings Page — Phase F
// =============================================================================
// User settings: profile editing (name) and password change.
// Uses BetterAuth client API directly — no server actions needed.
// =============================================================================

import { useState, useEffect } from "react";
import { authClient, useSession } from "@cocs/auth/client";

export default function SettingsPage() {
    const { data: session, isPending } = useSession();

    // ── Profile state ──
    const [name, setName] = useState("");
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ── Password state ──
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Seed name from session
    useEffect(() => {
        if (session?.user?.name) {
            setName(session.user.name);
        }
    }, [session?.user?.name]);

    // ── Profile save ──
    async function handleProfileSave() {
        if (!name.trim()) {
            setProfileMsg({ type: "error", text: "Name cannot be empty." });
            return;
        }
        if (name.trim() === session?.user?.name) {
            setProfileMsg({ type: "error", text: "No changes to save." });
            return;
        }
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            await authClient.updateUser({ name: name.trim() });
            setProfileMsg({ type: "success", text: "Name updated successfully." });
        } catch {
            setProfileMsg({ type: "error", text: "Failed to update name. Please try again." });
        }
        setProfileLoading(false);
    }

    // ── Password change ──
    async function handlePasswordChange() {
        setPasswordMsg(null);
        if (!currentPassword) {
            setPasswordMsg({ type: "error", text: "Current password is required." });
            return;
        }
        if (newPassword.length < 8) {
            setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: "error", text: "Passwords do not match." });
            return;
        }
        if (currentPassword === newPassword) {
            setPasswordMsg({ type: "error", text: "New password must be different from current password." });
            return;
        }
        setPasswordLoading(true);
        try {
            const result = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });
            if (result.error) {
                setPasswordMsg({ type: "error", text: result.error.message || "Failed to change password." });
            } else {
                setPasswordMsg({ type: "success", text: "Password changed successfully." });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setPasswordMsg({ type: "error", text: "Failed to change password. Please try again." });
        }
        setPasswordLoading(false);
    }

    if (isPending) {
        return (
            <div style={{ padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "560px" }}>
            <h1 style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "0.25rem",
            }}>
                Settings
            </h1>
            <p style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                marginBottom: "2rem",
            }}>
                Manage your profile and account security.
            </p>

            {/* ── Profile Section ── */}
            <section style={{
                padding: "1.5rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
            }}>
                <h2 style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span>👤</span> Profile
                </h2>

                {/* Avatar preview */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.25rem",
                }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        flexShrink: 0,
                    }}>
                        {name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.15rem" }}>
                            {session?.user?.name || "User"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {session?.user?.email || ""}
                        </div>
                    </div>
                </div>

                {/* Name field */}
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        htmlFor="settings-name"
                        style={{
                            display: "block",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            marginBottom: "0.35rem",
                        }}
                    >
                        Display Name
                    </label>
                    <input
                        id="settings-name"
                        type="text"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setProfileMsg(null); }}
                        style={{
                            width: "100%",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.85rem",
                            fontFamily: "inherit",
                        }}
                    />
                </div>

                {/* Email — read only */}
                <div style={{ marginBottom: "1rem" }}>
                    <label
                        style={{
                            display: "block",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            marginBottom: "0.35rem",
                        }}
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        style={{
                            width: "100%",
                            padding: "0.6rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--border-subtle)",
                            background: "var(--bg-tertiary, rgba(255,255,255,0.03))",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            fontFamily: "inherit",
                            cursor: "not-allowed",
                        }}
                    />
                    <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        Email cannot be changed at this time.
                    </p>
                </div>

                {/* Profile message */}
                {profileMsg && (
                    <div style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "0.75rem",
                        fontSize: "0.8rem",
                        background: profileMsg.type === "success"
                            ? "rgba(34, 197, 94, 0.08)"
                            : "rgba(239, 68, 68, 0.08)",
                        border: `1px solid ${profileMsg.type === "success"
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(239, 68, 68, 0.2)"}`,
                        color: profileMsg.type === "success" ? "#22c55e" : "#ef4444",
                    }}>
                        {profileMsg.text}
                    </div>
                )}

                <button
                    onClick={handleProfileSave}
                    disabled={profileLoading}
                    style={{
                        padding: "0.55rem 1.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--brand-orange)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        opacity: profileLoading ? 0.6 : 1,
                    }}
                >
                    {profileLoading ? "Saving..." : "Save Profile"}
                </button>
            </section>

            {/* ── Password Section ── */}
            <section style={{
                padding: "1.5rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.5rem",
            }}>
                <h2 style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                    <span>🔒</span> Password
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div>
                        <label
                            htmlFor="settings-current-pw"
                            style={{
                                display: "block",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                marginBottom: "0.35rem",
                            }}
                        >
                            Current Password
                        </label>
                        <input
                            id="settings-current-pw"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordMsg(null); }}
                            autoComplete="current-password"
                            style={{
                                width: "100%",
                                padding: "0.6rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-subtle)",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                fontSize: "0.85rem",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="settings-new-pw"
                            style={{
                                display: "block",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                marginBottom: "0.35rem",
                            }}
                        >
                            New Password
                        </label>
                        <input
                            id="settings-new-pw"
                            type="password"
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPasswordMsg(null); }}
                            autoComplete="new-password"
                            style={{
                                width: "100%",
                                padding: "0.6rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-subtle)",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                fontSize: "0.85rem",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="settings-confirm-pw"
                            style={{
                                display: "block",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                marginBottom: "0.35rem",
                            }}
                        >
                            Confirm New Password
                        </label>
                        <input
                            id="settings-confirm-pw"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMsg(null); }}
                            autoComplete="new-password"
                            style={{
                                width: "100%",
                                padding: "0.6rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border-subtle)",
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                fontSize: "0.85rem",
                                fontFamily: "inherit",
                            }}
                        />
                    </div>
                </div>

                {/* Password message */}
                {passwordMsg && (
                    <div style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "0.75rem",
                        fontSize: "0.8rem",
                        background: passwordMsg.type === "success"
                            ? "rgba(34, 197, 94, 0.08)"
                            : "rgba(239, 68, 68, 0.08)",
                        border: `1px solid ${passwordMsg.type === "success"
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(239, 68, 68, 0.2)"}`,
                        color: passwordMsg.type === "success" ? "#22c55e" : "#ef4444",
                    }}>
                        {passwordMsg.text}
                    </div>
                )}

                <button
                    onClick={handlePasswordChange}
                    disabled={passwordLoading}
                    style={{
                        padding: "0.55rem 1.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        borderRadius: "var(--radius-sm)",
                        background: "var(--brand-orange)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        opacity: passwordLoading ? 0.6 : 1,
                    }}
                >
                    {passwordLoading ? "Changing..." : "Change Password"}
                </button>
            </section>

            {/* ── Account Info ── */}
            <section style={{
                padding: "1rem 1.5rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span>Email verified</span>
                    <span style={{ color: session?.user?.emailVerified ? "#22c55e" : "#ef4444" }}>
                        {session?.user?.emailVerified ? "✓ Verified" : "✗ Not verified"}
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Account created</span>
                    <span>
                        {session?.user?.createdAt
                            ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                    </span>
                </div>
            </section>
        </div>
    );
}
