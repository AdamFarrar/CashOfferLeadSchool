import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-[1.75rem] mx-auto mb-6" style={{ background: "var(--brand-orange-glow)" }}>
                🔑
            </div>

            <h1 className="text-2xl mb-3">
                Reset Password
            </h1>

            <p className="text-[0.9rem] text-[var(--text-secondary)] leading-relaxed mb-8">
                Password reset will be available in a future update. Please contact
                support if you need help accessing your account.
            </p>

            <Link
                href="/login"
                className="btn-ghost w-full flex"
            >
                ← Back to Login
            </Link>
        </div>
    );
}
