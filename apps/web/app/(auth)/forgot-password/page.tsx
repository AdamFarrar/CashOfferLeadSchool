import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <div style={{ textAlign: "center" }}>
            <div
                style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    background: "var(--brand-orange-glow)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.75rem",
                    margin: "0 auto 1.5rem",
                }}
            >
                🔑
            </div>

            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                Reset Password
            </h1>

            <p
                style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    marginBottom: "2rem",
                }}
            >
                Password reset will be available in a future update. Please contact
                support if you need help accessing your account.
            </p>

            <Link
                href="/login"
                className="btn-ghost"
                style={{ width: "100%", display: "flex" }}
            >
                ← Back to Login
            </Link>
        </div>
    );
}
