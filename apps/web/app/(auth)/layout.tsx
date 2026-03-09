import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 1.5rem",
                position: "relative",
            }}
        >
            {/* Background glow */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "30rem",
                    height: "30rem",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Link
                href="/"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    marginBottom: "2.5rem",
                    position: "relative",
                }}
            >
                <span
                    style={{
                        width: "2.25rem",
                        height: "2.25rem",
                        borderRadius: "0.625rem",
                        background:
                            "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                    }}
                >
                    🏠
                </span>
                Cash Offer Conversion School
            </Link>

            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: "26rem",
                    padding: "2.5rem",
                    position: "relative",
                }}
            >
                {children}
            </div>

            <Link
                href="/"
                style={{
                    marginTop: "2rem",
                    color: "var(--text-muted)",
                    fontSize: "0.825rem",
                    textDecoration: "none",
                    position: "relative",
                }}
            >
                ← Back to home
            </Link>
        </div>
    );
}
