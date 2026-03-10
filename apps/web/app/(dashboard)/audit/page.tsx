import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book Audit — Cash Offer Conversion School",
    description: "Book a personalized conversion audit for your operation.",
};

export default function AuditPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-[1.75rem] mb-2">Book Your Conversion Audit</h1>
                <p className="text-[color:var(--text-secondary)] text-[0.95rem]">
                    A personalized review of your pipeline, close rate, and conversion systems.
                </p>
            </div>

            <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <h2 className="text-lg font-semibold mb-2">Audit Scheduling Coming Soon</h2>
                <p className="text-[color:var(--text-secondary)] text-[0.9rem] max-w-md mx-auto leading-relaxed mb-6">
                    Conversion audits will be available during Season 1. You&apos;ll get a
                    one-on-one review of your current operation — lead sources, call scripts,
                    appointment flow, and close rates — with actionable recommendations.
                </p>
                <div className="glass-card p-4 max-w-sm mx-auto text-left">
                    <h3 className="text-[0.8rem] font-semibold text-[color:var(--text-muted)] uppercase tracking-wide mb-3">
                        What&apos;s Covered
                    </h3>
                    <ul className="flex flex-col gap-2 text-[0.85rem] text-[color:var(--text-secondary)]">
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
