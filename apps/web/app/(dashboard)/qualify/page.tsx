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

    return (
        <div className="qualify-container">
            <div className="mb-8">
                <h1 className="text-2xl mb-2">Help Us Tailor This</h1>
                <p className="text-[color:var(--text-secondary)] text-[0.9rem]">
                    A few quick questions so we can personalize your Season 1 experience.
                </p>
            </div>

            {/* Step indicator */}
            <div className="qualify-progress">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`qualify-step ${s <= step ? "qualify-step-active" : ""}`}
                    />
                ))}
            </div>

            <div className="glass-card p-8">
                {/* Step 1: Business Info */}
                {step === 1 && (
                    <div className="form-section">
                        <h2 className="text-lg mb-1">Business Information</h2>

                        <div className="form-group">
                            <label htmlFor="businessName" className="form-label text-[color:var(--text-secondary)]">
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

                        <div className="form-group">
                            <label htmlFor="businessType" className="form-label text-[color:var(--text-secondary)]">
                                Business Type *
                            </label>
                            <select
                                id="businessType"
                                className="select-field"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.target.value)}
                            >
                                <option value="">Select type...</option>
                                {BUSINESS_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="marketArea" className="form-label text-[color:var(--text-secondary)]">
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
                    <div className="form-section">
                        <h2 className="text-lg mb-1">Experience & Budget</h2>

                        <div className="form-group">
                            <label htmlFor="yearsExperience" className="form-label text-[color:var(--text-secondary)]">
                                Years of Experience *
                            </label>
                            <select
                                id="yearsExperience"
                                className="select-field"
                                value={yearsExperience}
                                onChange={(e) => setYearsExperience(e.target.value)}
                            >
                                <option value="">Select experience...</option>
                                {EXPERIENCE_LEVELS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label text-[color:var(--text-secondary)]">Current Lead Sources</label>
                            <div className="grid grid-cols-2 gap-2">
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
                                            className={`py-2 px-3 text-[0.8rem] rounded-[var(--radius-sm)] border cursor-pointer text-left transition-all ${selected
                                                ? "border-[var(--brand-orange)] bg-[var(--brand-orange-glow)] text-[color:var(--brand-orange-light)]"
                                                : "border-[var(--border-default)] bg-transparent text-[color:var(--text-secondary)]"
                                                }`}
                                        >
                                            {source}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="monthlyBudget" className="form-label text-[color:var(--text-secondary)]">
                                Monthly Marketing Budget *
                            </label>
                            <select
                                id="monthlyBudget"
                                className="select-field"
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
                    <div className="form-section">
                        <h2 className="text-lg mb-1">Your Goals</h2>

                        <div className="form-group">
                            <label htmlFor="goals" className="form-label text-[color:var(--text-secondary)]">
                                What are your goals with cash offer leads?
                            </label>
                            <textarea
                                id="goals"
                                className="textarea-field"
                                placeholder="Tell us what you hope to achieve..."
                                value={goals}
                                onChange={(e) => setGoals(e.target.value)}
                                rows={5}
                            />
                        </div>

                        {/* Summary */}
                        <div className="p-4 bg-[var(--bg-secondary)] rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
                            <div className="text-[0.8rem] font-semibold text-[color:var(--text-muted)] mb-3 uppercase tracking-wide">
                                Summary
                            </div>
                            <div className="grid gap-1.5 text-[0.85rem] text-[color:var(--text-secondary)]">
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
                    <div className="mt-4 py-3 px-4 rounded-[var(--radius-md)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-sm">
                        {error}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6 gap-3">
                    {step > 1 ? (
                        <button onClick={prevStep} className="btn-ghost flex-1">
                            ← Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button onClick={nextStep} className="btn-primary flex-1">
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className={`btn-primary flex-1 ${loading ? "opacity-70" : ""}`}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Complete"}
                        </button>
                    )}
                </div>
            </div>

            {/* Step label */}
            <p className="text-center mt-4 text-xs text-[color:var(--text-muted)]">
                Step {step} of 3
            </p>
        </div>
    );
}
