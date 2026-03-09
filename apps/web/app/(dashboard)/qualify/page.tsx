"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, useActiveOrganization } from "@cocs/auth/client";
import { submitQualification } from "@/app/actions/qualification";
import { track } from "@cocs/analytics";
import {
    QualificationStarted,
    QualificationStepCompleted,
    QualificationSubmitted,
} from "@cocs/analytics/event-contracts";

const BUSINESS_TYPES = [
    "Real Estate Investor",
    "Lead Generation Agency",
    "Wholesaler",
    "Real Estate Agent",
    "Marketing Agency",
    "Other",
];

const EXPERIENCE_LEVELS = [
    "Less than 1 year",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10+ years",
];

const BUDGET_RANGES = [
    "Under $1,000/mo",
    "$1,000 - $3,000/mo",
    "$3,000 - $5,000/mo",
    "$5,000 - $10,000/mo",
    "$10,000+/mo",
];

const LEAD_SOURCES = [
    "PPC (Google Ads)",
    "Facebook Ads",
    "Direct Mail",
    "Cold Calling",
    "SEO / Organic",
    "Referrals",
    "Bought Lists",
    "None yet",
];

export default function QualificationPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: org } = useActiveOrganization();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const startTimeRef = useRef(Date.now());
    const stepStartRef = useRef(Date.now());

    useEffect(() => {
        track(QualificationStarted, {});
    }, []);

    // Step 1: Business Info
    const [businessName, setBusinessName] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [marketArea, setMarketArea] = useState("");

    // Step 2: Experience
    const [yearsExperience, setYearsExperience] = useState("");
    const [currentLeadSources, setCurrentLeadSources] = useState<string[]>([]);
    const [monthlyBudget, setMonthlyBudget] = useState("");

    // Step 3: Goals
    const [goals, setGoals] = useState("");

    function validateStep1() {
        if (!businessName.trim()) return "Business name is required.";
        if (!businessType) return "Business type is required.";
        if (!marketArea.trim()) return "Market area is required.";
        return null;
    }

    function validateStep2() {
        if (!yearsExperience) return "Please select your experience level.";
        if (!monthlyBudget) return "Please select a budget range.";
        return null;
    }

    function nextStep() {
        setError("");
        if (step === 1) {
            const err = validateStep1();
            if (err) { setError(err); return; }
        }
        if (step === 2) {
            const err = validateStep2();
            if (err) { setError(err); return; }
        }
        const stepNames = ["", "Business Info", "Experience & Budget", "Goals"];
        const timeOnStep = Math.round((Date.now() - stepStartRef.current) / 1000);
        track(QualificationStepCompleted, {
            step_number: step,
            step_name: stepNames[step] || "",
            time_on_step_s: timeOnStep,
        });
        stepStartRef.current = Date.now();
        setStep((s) => Math.min(s + 1, 3));
    }

    function prevStep() {
        setError("");
        setStep((s) => Math.max(s - 1, 1));
    }

    async function handleSubmit() {
        setError("");
        setLoading(true);

        // UX guard — redirect to login if session seems absent
        if (!session?.user?.id) {
            setError("Authentication error. Please sign in again.");
            setLoading(false);
            return;
        }

        const result = await submitQualification({
            businessName,
            businessType,
            yearsExperience,
            monthlyBudget,
            marketArea,
            currentLeadSources: currentLeadSources.join(", "),
            goals,
        });

        if (!result.success) {
            setError("error" in result ? result.error : "Submission failed.");
            setLoading(false);
            return;
        }

        router.push("/qualify/confirmation");

        const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
        track(QualificationSubmitted, {
            total_steps: 3,
            total_time_s: totalTime,
            business_type: businessType,
        });
    }

    const labelStyle = {
        display: "block",
        fontSize: "0.825rem",
        fontWeight: 600,
        color: "var(--text-secondary)",
        marginBottom: "0.5rem",
    } as const;

    const selectStyle = {
        width: "100%",
        padding: "0.75rem 1rem",
        fontSize: "0.95rem",
        color: "var(--text-primary)",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        outline: "none",
        appearance: "none" as const,
        cursor: "pointer",
    };

    return (
        <div style={{ maxWidth: "36rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    Operator Qualification
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Tell us about your business so we can tailor your experience.
                </p>
            </div>

            {/* Step indicator */}
            <div
                style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "2rem",
                }}
            >
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        style={{
                            flex: 1,
                            height: "3px",
                            borderRadius: "2px",
                            background:
                                s <= step
                                    ? "var(--brand-orange)"
                                    : "var(--border-default)",
                            transition: "background 0.3s",
                        }}
                    />
                ))}
            </div>

            <div className="glass-card" style={{ padding: "2rem" }}>
                {/* Step 1: Business Info */}
                {step === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>
                            Business Information
                        </h2>

                        <div>
                            <label htmlFor="businessName" style={labelStyle}>
                                Business Name *
                            </label>
                            <input
                                id="businessName"
                                className="input-field"
                                placeholder="Acme Real Estate"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="businessType" style={labelStyle}>
                                Business Type *
                            </label>
                            <select
                                id="businessType"
                                style={selectStyle}
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                            >
                                <option value="">Select type...</option>
                                {BUSINESS_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="marketArea" style={labelStyle}>
                                Market Area / Region *
                            </label>
                            <input
                                id="marketArea"
                                className="input-field"
                                placeholder="e.g., Dallas-Fort Worth, TX"
                                value={marketArea}
                                onChange={(e) => setMarketArea(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Experience */}
                {step === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>
                            Experience & Budget
                        </h2>

                        <div>
                            <label htmlFor="yearsExperience" style={labelStyle}>
                                Years of Experience *
                            </label>
                            <select
                                id="yearsExperience"
                                style={selectStyle}
                                value={yearsExperience}
                                onChange={(e) => setYearsExperience(e.target.value)}
                            >
                                <option value="">Select experience...</option>
                                {EXPERIENCE_LEVELS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={labelStyle}>Current Lead Sources</label>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: "0.5rem",
                                }}
                            >
                                {LEAD_SOURCES.map((source) => {
                                    const selected = currentLeadSources.includes(source);
                                    return (
                                        <button
                                            key={source}
                                            type="button"
                                            onClick={() => {
                                                setCurrentLeadSources((prev) =>
                                                    selected
                                                        ? prev.filter((s) => s !== source)
                                                        : [...prev, source]
                                                );
                                            }}
                                            style={{
                                                padding: "0.5rem 0.75rem",
                                                fontSize: "0.8rem",
                                                borderRadius: "var(--radius-sm)",
                                                border: `1px solid ${selected
                                                    ? "var(--brand-orange)"
                                                    : "var(--border-default)"
                                                    }`,
                                                background: selected
                                                    ? "var(--brand-orange-glow)"
                                                    : "transparent",
                                                color: selected
                                                    ? "var(--brand-orange-light)"
                                                    : "var(--text-secondary)",
                                                cursor: "pointer",
                                                textAlign: "left",
                                                transition: "all 0.15s",
                                            }}
                                        >
                                            {source}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="monthlyBudget" style={labelStyle}>
                                Monthly Marketing Budget *
                            </label>
                            <select
                                id="monthlyBudget"
                                style={selectStyle}
                                value={monthlyBudget}
                                onChange={(e) => setMonthlyBudget(e.target.value)}
                            >
                                <option value="">Select budget...</option>
                                {BUDGET_RANGES.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 3: Goals */}
                {step === 3 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.25rem" }}>
                            Your Goals
                        </h2>

                        <div>
                            <label htmlFor="goals" style={labelStyle}>
                                What are your goals with cash offer leads?
                            </label>
                            <textarea
                                id="goals"
                                className="input-field"
                                placeholder="Tell us what you hope to achieve..."
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                                rows={5}
                                style={{
                                    resize: "vertical",
                                    minHeight: "8rem",
                                }}
                            />
                        </div>

                        {/* Summary */}
                        <div
                            style={{
                                padding: "1rem",
                                background: "var(--bg-secondary)",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border-subtle)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "var(--text-muted)",
                                    marginBottom: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                Summary
                            </div>
                            <div
                                style={{
                                    display: "grid",
                                    gap: "0.375rem",
                                    fontSize: "0.85rem",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <div><strong>Business:</strong> {businessName} ({businessType})</div>
                                <div><strong>Market:</strong> {marketArea}</div>
                                <div><strong>Experience:</strong> {yearsExperience}</div>
                                <div><strong>Budget:</strong> {monthlyBudget}</div>
                                {currentLeadSources.length > 0 && (
                                    <div><strong>Sources:</strong> {currentLeadSources.join(", ")}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem 1rem",
                            borderRadius: "var(--radius-md)",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#ef4444",
                            fontSize: "0.875rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Navigation */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "1.5rem",
                        gap: "0.75rem",
                    }}
                >
                    {step > 1 ? (
                        <button onClick={prevStep} className="btn-ghost" style={{ flex: 1 }}>
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button onClick={nextStep} className="btn-primary" style={{ flex: 1 }}>
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                flex: 1,
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? "Submitting..." : "Submit Qualification"}
                        </button>
                    )}
                </div>
            </div>

            {/* Step label */}
            <p
                style={{
                    textAlign: "center",
                    marginTop: "1rem",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                }}
            >
                Step {step} of 3
            </p>
        </div>
    );
}
