import type { Metadata } from "next";
import { SectionHeader } from "@/app/components/ui/Cards";

export const metadata: Metadata = {
    title: "Book Audit — Cash Offer Conversion School",
    description: "Book a personalized conversion audit for your operation.",
};

export default function AuditPage() {
    return (
        <div>
            <SectionHeader
                title="Book Your Conversion Audit"
                subtitle="A personalized review of your pipeline, close rate, and conversion systems."
            />

            <div style={{
                textAlign: "center",
                padding: "2rem",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
            }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📋</div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Audit Scheduling Coming Soon
                </h2>
                <p style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    maxWidth: "28rem",
                    margin: "0 auto 1.5rem",
                    lineHeight: 1.6,
                }}>
                    Conversion audits will be available during Season 1. You&apos;ll get a
                    one-on-one review of your current operation — lead sources, call scripts,
                    appointment flow, and close rates — with actionable recommendations.
                </p>
                <div style={{
                    padding: "1.25rem",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    maxWidth: "20rem",
                    margin: "0 auto",
                    textAlign: "left",
                }}>
                    <h3 style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.75rem",
                    }}>
                        What&apos;s Covered
                    </h3>
                    <ul style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                    }}>
                        <li>✓ Pipeline analysis</li>
                        <li>✓ Speed-to-lead assessment</li>
                        <li>✓ Call script review</li>
                        <li>✓ Offer structure audit</li>
                        <li>✓ Follow-up system evaluation</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
