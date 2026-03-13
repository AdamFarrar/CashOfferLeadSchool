"use client";

// =============================================================================
// ErrorBoundaryCard — Phase H (Product Hardening)
// =============================================================================
// React error boundary that catches render errors in child components.
// Shows a friendly card with retry option. Never exposes raw errors.
// =============================================================================

import React from "react";

interface Props {
    children: React.ReactNode;
    fallbackTitle?: string;
    fallbackDescription?: string;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundaryCard extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: "1.5rem",
                    background: "rgba(239, 68, 68, 0.05)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid rgba(239, 68, 68, 0.15)",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⚠️</div>
                    <div style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "0.35rem",
                    }}>
                        {this.props.fallbackTitle ?? "Something went wrong"}
                    </div>
                    <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        margin: "0 0 1rem 0",
                    }}>
                        {this.props.fallbackDescription ?? "This section couldn't load. Try refreshing the page."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: "var(--brand-orange)",
                            background: "var(--brand-orange-glow)",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            padding: "0.4rem 1rem",
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
