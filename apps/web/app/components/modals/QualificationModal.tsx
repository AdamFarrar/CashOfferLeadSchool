"use client";

// =============================================================================
// QualificationModal — Phase A UX Flow Corrections
// =============================================================================
// Forced modal for unqualified users. Cannot be dismissed until completed.
// Replaces the standalone /qualify page approach.
// After completion: inline success with calendar CTA + "Go to Dashboard".
// =============================================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { submitQualification } from "@/app/actions/qualification";
import { track } from "@cols/analytics";
import {
    QualificationStarted,
    QualificationStepCompleted,
    QualificationSubmitted,
} from "@cols/analytics/event-contracts";

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

interface QualificationModalProps {
    nextSessionDate: string | null;
    onComplete: () => void;
}

export function QualificationModal({ nextSessionDate, onComplete }: QualificationModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [completed, setCompleted] = useState(false);
    const startTimeRef = useRef(Date.now());
    const stepStartRef = useRef(Date.now());
    const submittingRef = useRef(false);
    const modalRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        track(QualificationStarted, {});
    }, []);

    // Body scroll lock — prevent scrolling behind modal
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, []);

    // Focus trap — focus the modal on mount
    useEffect(() => {
        modalRef.current?.focus();
    }, []);

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

    const handleSubmit = useCallback(async () => {
        if (submittingRef.current) return; // double-submit guard
        submittingRef.current = true;
        setError("");
        setLoading(true);

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
            submittingRef.current = false;
            return;
        }

        const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
        track(QualificationSubmitted, {
            total_steps: 3,
            total_time_s: totalTime,
            business_type: businessType,
        });

        setLoading(false);
        submittingRef.current = false;
        setCompleted(true);
    }, [businessName, businessType, yearsExperience, monthlyBudget, marketArea, currentLeadSources, goals]);

    // ── Input styling helper ──
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.6rem 0.75rem",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        color: "var(--text-primary)",
        fontSize: "0.85rem",
        fontFamily: "inherit",
    };

    const selectStyle = inputStyle;

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.75rem",
        fontWeight: 600,
        color: "var(--text-muted)",
        marginBottom: "0.35rem",
    };

    // ── Completion screen ──
    if (completed) {
        return (
            <div className="qualification-modal-overlay" role="dialog" aria-modal="true" aria-label="Profile complete">
                <div className="qualification-modal" ref={modalRef} tabIndex={-1}>
                    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎉</div>
                        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            You&apos;re All Set!
                        </h2>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                            Your profile is complete. We&apos;ll use this to personalize your experience.
                        </p>

                        {nextSessionDate && (
                            <div style={{
                                padding: "1rem 1.25rem",
                                border: "1px solid var(--border-subtle)",
                                borderRadius: "var(--radius-md)",
                                marginBottom: "1.5rem",
                                textAlign: "left",
                            }}>
                                <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                                    📅 Your Next Live Session
                                </div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                                    {new Date(nextSessionDate).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        timeZoneName: "short",
                                    })}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={onComplete}
                            style={{
                                padding: "0.6rem 1.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                borderRadius: "var(--radius-sm)",
                                background: "var(--brand-orange)",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                width: "100%",
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form steps ──
    return (
        <div className="qualification-modal-overlay" role="dialog" aria-modal="true" aria-label="Qualification questionnaire">
            <div className="qualification-modal" ref={modalRef} tabIndex={-1}>
                <div style={{ padding: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                        Help Us Tailor This
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                        A few quick questions so we can personalize your experience.
                    </p>

                    {/* Step indicator */}
                    <div style={{ display: "flex", gap: "0.35rem", marginBottom: "1.25rem" }}>
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                style={{
                                    flex: 1,
                                    height: "3px",
                                    borderRadius: "2px",
                                    background: s <= step ? "var(--brand-orange)" : "var(--border-subtle)",
                                    transition: "background 0.2s",
                                }}
                            />
                        ))}
                    </div>

                    {/* Step 1: Business Info */}
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div>
                                <label htmlFor="qual-business-name" style={labelStyle}>Business Name *</label>
                                <input
                                    id="qual-business-name"
                                    type="text"
                                    placeholder="Acme Real Estate"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label htmlFor="qual-business-type" style={labelStyle}>Business Type *</label>
                                <select
                                    id="qual-business-type"
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">Select type...</option>
                                    {BUSINESS_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="qual-market-area" style={labelStyle}>Market Area / Region *</label>
                                <input
                                    id="qual-market-area"
                                    type="text"
                                    placeholder="e.g., Dallas-Fort Worth, TX"
                                    value={marketArea}
                                    onChange={(e) => setMarketArea(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Experience */}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div>
                                <label htmlFor="qual-experience" style={labelStyle}>Years of Experience *</label>
                                <select
                                    id="qual-experience"
                                    value={yearsExperience}
                                    onChange={(e) => setYearsExperience(e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">Select experience...</option>
                                    {EXPERIENCE_LEVELS.map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Current Lead Sources</label>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem" }}>
                                    {LEAD_SOURCES.map((source) => {
                                        const selected = currentLeadSources.includes(source);
                                        return (
                                            <button
                                                key={source}
                                                type="button"
                                                onClick={() => {
                                                    setCurrentLeadSources((prev) =>
                                                        selected ? prev.filter((s) => s !== source) : [...prev, source]
                                                    );
                                                }}
                                                style={{
                                                    padding: "0.4rem 0.6rem",
                                                    fontSize: "0.75rem",
                                                    borderRadius: "var(--radius-sm)",
                                                    border: `1px solid ${selected ? "var(--brand-orange)" : "var(--border-subtle)"}`,
                                                    background: selected ? "var(--brand-orange-glow)" : "transparent",
                                                    color: selected ? "var(--brand-orange)" : "var(--text-secondary)",
                                                    cursor: "pointer",
                                                    textAlign: "left",
                                                }}
                                            >
                                                {source}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="qual-budget" style={labelStyle}>Monthly Marketing Budget *</label>
                                <select
                                    id="qual-budget"
                                    value={monthlyBudget}
                                    onChange={(e) => setMonthlyBudget(e.target.value)}
                                    style={selectStyle}
                                >
                                    <option value="">Select budget...</option>
                                    {BUDGET_RANGES.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Goals (no summary — removed per product review) */}
                    {step === 3 && (
                        <div>
                            <label htmlFor="qual-goals" style={labelStyle}>What are your goals with cash offer leads?</label>
                            <textarea
                                id="qual-goals"
                                placeholder="Tell us what you hope to achieve..."
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                                rows={4}
                                style={{
                                    ...inputStyle,
                                    resize: "vertical",
                                    lineHeight: 1.5,
                                }}
                            />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: "0.75rem",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            fontSize: "0.8rem",
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                style={{
                                    flex: 1,
                                    padding: "0.55rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    borderRadius: "var(--radius-sm)",
                                    border: "1px solid var(--border-subtle)",
                                    background: "transparent",
                                    color: "var(--text-secondary)",
                                    cursor: "pointer",
                                }}
                            >
                                ← Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={nextStep}
                                style={{
                                    flex: 1,
                                    padding: "0.55rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--brand-orange)",
                                    color: "#fff",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    padding: "0.55rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--brand-orange)",
                                    color: "#fff",
                                    border: "none",
                                    cursor: "pointer",
                                    opacity: loading ? 0.6 : 1,
                                }}
                            >
                                {loading ? "Submitting..." : "Complete"}
                            </button>
                        )}
                    </div>

                    <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                        Step {step} of 3
                    </p>
                </div>
            </div>
        </div>
    );
}
