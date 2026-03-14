"use client";

// =============================================================================
// Conduct Agreement Modal
// =============================================================================
// One-time gate before first post. Reading is always allowed.
// Users who have already agreed never see this.
// =============================================================================

import { useState, useTransition } from "react";
import { agreeToConductAction } from "@/app/actions/discussion";

interface Props {
    onAgreed: () => void;
}

export function ConductAgreementModal({ onAgreed }: Props) {
    const [isPending, startTransition] = useTransition();
    const [checked, setChecked] = useState(false);

    function handleAgree() {
        startTransition(async () => {
            const result = await agreeToConductAction();
            if (result.success) {
                onAgreed();
            }
        });
    }

    return (
        <div className="conduct-overlay" role="dialog" aria-modal="true" aria-label="Community Guidelines Agreement">
            <div className="conduct-modal">
                <div className="conduct-icon">🤝</div>
                <h2 className="conduct-title">Community Guidelines</h2>
                <p className="conduct-subtitle">
                    Before you start posting, please review and agree to our community guidelines:
                </p>

                <div className="conduct-rules">
                    <div className="conduct-rule">
                        <span className="conduct-rule-icon">💬</span>
                        <div>
                            <strong>Be Respectful</strong>
                            <p>Treat fellow operators with respect. Disagreements are fine — personal attacks are not.</p>
                        </div>
                    </div>
                    <div className="conduct-rule">
                        <span className="conduct-rule-icon">🎯</span>
                        <div>
                            <strong>Stay On Topic</strong>
                            <p>Keep discussions relevant to cash offer lead generation, real estate operations, and program content.</p>
                        </div>
                    </div>
                    <div className="conduct-rule">
                        <span className="conduct-rule-icon">🚫</span>
                        <div>
                            <strong>No Spam or Self-Promotion</strong>
                            <p>Don't use discussions to promote your services, products, or external links.</p>
                        </div>
                    </div>
                    <div className="conduct-rule">
                        <span className="conduct-rule-icon">🔒</span>
                        <div>
                            <strong>Protect Privacy</strong>
                            <p>Don't share personal information about yourself or others (phone numbers, addresses, etc.).</p>
                        </div>
                    </div>
                </div>

                <label className="conduct-checkbox-label">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                        className="conduct-checkbox"
                    />
                    I agree to follow these community guidelines
                </label>

                <button
                    onClick={handleAgree}
                    disabled={!checked || isPending}
                    className="conduct-agree-btn"
                    aria-label="Agree to community guidelines"
                >
                    {isPending ? "Saving..." : "I Agree — Let Me Post"}
                </button>
            </div>
        </div>
    );
}
