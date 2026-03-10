import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 relative">
            {/* Background glow */}
            <div
                aria-hidden="true"
                className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%)",
                }}
            />

            <Link
                href="/"
                className="flex items-center gap-2.5 no-underline font-bold text-[1.1rem] mb-10 relative"
                style={{ color: "var(--text-primary)" }}
            >
                <span
                    className="w-9 h-9 rounded-[0.625rem] flex items-center justify-center text-base"
                    style={{
                        background:
                            "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                    }}
                >
                    🏠
                </span>
                Cash Offer Conversion School
            </Link>

            <div className="glass-card w-full max-w-[26rem] p-10 relative">
                {children}
            </div>

            <Link
                href="/"
                className="mt-8 text-[0.825rem] no-underline relative"
                style={{ color: "var(--text-muted)" }}
            >
                ← Back to home
            </Link>
        </div>
    );
}
