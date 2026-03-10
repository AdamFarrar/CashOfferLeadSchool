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

            <div className="glass-card p-6 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="text-lg font-semibold mb-2">Audit Scheduling Coming Soon</h2>
                <p className="text-[color:var(--text-secondary)] text-sm max-w-md mx-auto leading-relaxed mb-6">
                    Conversion audits will be available during Season 1. You&apos;ll get a
                    one-on-one review of your current operation — lead sources, call scripts,
                    appointment flow, and close rates — with actionable recommendations.
                </p>
                <div className="glass-card p-6 max-w-sm mx-auto text-left">
                    <h3 className="text-xs font-semibold text-[color:var(--text-muted)] uppercase tracking-wide mb-3">
                        What&apos;s Covered
                    </h3>
                    <ul className="flex flex-col gap-2 text-sm text-[color:var(--text-secondary)]">
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
