import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCta } from "./components/TrackedCta";

export const metadata: Metadata = {
    title: "Cash Offer Conversion School — Master Cash Offer Lead Generation",
    description:
        "Learn to build and operate a profitable cash offer lead generation and conversion business. Get qualified, educated, and connected.",
    openGraph: {
        title: "Cash Offer Conversion School",
        description:
            "Master cash offer lead generation and conversion. Education. Qualification. Results.",
        type: "website",
    },
};

const VALUE_PROPS = [
    {
        icon: "🎓",
        title: "Education",
        description:
            "Step-by-step academy with video courses, downloads, and expert coaching to master every aspect of cash offer lead generation.",
        color: "var(--accent-blue)",
    },
    {
        icon: "✅",
        title: "Qualification",
        description:
            "Our structured qualification process ensures you're ready to operate — with the right knowledge, systems, and mindset.",
        color: "var(--brand-orange)",
    },
    {
        icon: "📈",
        title: "Conversion",
        description:
            "Turn knowledge into revenue. Our conversion intelligence tracks your readiness and connects you with live deal flow.",
        color: "var(--accent-green)",
    },
];

const STEPS = [
    {
        step: "01",
        title: "Sign Up & Qualify",
        description:
            "Complete our quick qualification form so we understand your experience, market, and goals.",
    },
    {
        step: "02",
        title: "Learn the System",
        description:
            "Work through our structured academy — video episodes, downloads, and hands-on exercises.",
    },
    {
        step: "03",
        title: "Start Converting",
        description:
            "Apply what you've learned, get coaching support, and begin generating qualified cash offers.",
    },
];

const TESTIMONIALS = [
    {
        name: "Marcus R.",
        role: "Real Estate Investor",
        quote:
            "The qualification process alone saved me months of trial and error. I knew exactly where I stood before investing a dollar.",
    },
    {
        name: "Sarah T.",
        role: "Lead Generation Operator",
        quote:
            "Finally, a structured system for cash offer leads — not some guru course. Real processes, real results.",
    },
    {
        name: "David K.",
        role: "Agency Owner",
        quote:
            "The academy content is top-tier. The coaching calls filled in every gap. My team was operational in weeks, not months.",
    },
];

export default function LandingPage() {
    return (
        <>
            {/* ===== NAV BAR ===== */}
            <nav
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "rgba(5, 5, 5, 0.8)",
                    backdropFilter: "blur(16px)",
                }}
            >
                <div
                    className="section-container"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: "4rem",
                    }}
                >
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
                        }}
                    >
                        <span
                            style={{
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "0.5rem",
                                background:
                                    "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.9rem",
                            }}
                        >
                            🏠
                        </span>
                        COCS
                    </Link>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                        <Link
                            href="/login"
                            className="btn-ghost"
                            style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="btn-primary"
                            style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* ===== HERO ===== */}
                <section
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: "8rem 1.5rem 5rem",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Background glow */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            top: "15%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "40rem",
                            height: "40rem",
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)",
                            pointerEvents: "none",
                        }}
                    />

                    <div className="animate-fade-in-up" style={{ position: "relative" }}>
                        <span className="badge" style={{ marginBottom: "1.5rem" }}>
                            ● Now Open for Operators
                        </span>
                    </div>

                    <h1
                        className="animate-fade-in-up animate-delay-100"
                        style={{
                            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                            maxWidth: "52rem",
                            position: "relative",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Master Cash Offer{" "}
                        <span
                            style={{
                                background:
                                    "linear-gradient(135deg, var(--brand-orange-light), var(--brand-orange))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Lead Generation
                        </span>
                    </h1>

                    <p
                        className="animate-fade-in-up animate-delay-200"
                        style={{
                            fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
                            color: "var(--text-secondary)",
                            maxWidth: "38rem",
                            lineHeight: 1.7,
                            marginBottom: "2.5rem",
                            position: "relative",
                        }}
                    >
                        The complete system to build and operate a cash offer lead business.
                        Education. Qualification. Conversion.
                    </p>

                    <div
                        className="animate-fade-in-up animate-delay-300"
                        style={{
                            display: "flex",
                            gap: "1rem",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            position: "relative",
                        }}
                    >
                        <TrackedCta href="/register" className="btn-primary" ctaId="hero_register" ctaText="Start Your Qualification" section="hero">
                            Start Your Qualification →
                        </TrackedCta>
                        <a href="#how-it-works" className="btn-ghost">
                            See How It Works
                        </a>
                    </div>

                    {/* Trust bar */}
                    <div
                        className="animate-fade-in-up animate-delay-500"
                        style={{
                            marginTop: "4rem",
                            display: "flex",
                            gap: "2rem",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            position: "relative",
                        }}
                    >
                        <span>✓ No upfront costs</span>
                        <span>✓ Structured curriculum</span>
                        <span>✓ Expert coaching</span>
                    </div>
                </section>

                {/* ===== VALUE PROPOSITIONS ===== */}
                <section
                    style={{
                        padding: "6rem 0",
                        borderTop: "1px solid var(--border-subtle)",
                    }}
                >
                    <div className="section-container">
                        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                            <span
                                className="badge"
                                style={{ marginBottom: "1rem", display: "inline-flex" }}
                            >
                                Why COCS
                            </span>
                            <h2
                                style={{
                                    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                                    marginTop: "0.75rem",
                                }}
                            >
                                Three Pillars of Success
                            </h2>
                            <p
                                style={{
                                    color: "var(--text-secondary)",
                                    maxWidth: "32rem",
                                    margin: "1rem auto 0",
                                    fontSize: "1.05rem",
                                }}
                            >
                                Everything you need to go from beginner to qualified operator.
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {VALUE_PROPS.map((prop) => (
                                <div
                                    key={prop.title}
                                    className="glass-card"
                                    style={{ padding: "2rem" }}
                                >
                                    <div
                                        style={{
                                            width: "3rem",
                                            height: "3rem",
                                            borderRadius: "var(--radius-md)",
                                            background: `${prop.color}15`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.5rem",
                                            marginBottom: "1.25rem",
                                        }}
                                    >
                                        {prop.icon}
                                    </div>
                                    <h3
                                        style={{
                                            fontSize: "1.25rem",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        {prop.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.65,
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        {prop.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== HOW IT WORKS ===== */}
                <section
                    id="how-it-works"
                    style={{
                        padding: "6rem 0",
                        background: "var(--bg-secondary)",
                        borderTop: "1px solid var(--border-subtle)",
                        borderBottom: "1px solid var(--border-subtle)",
                    }}
                >
                    <div className="section-container">
                        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                            <span
                                className="badge"
                                style={{ marginBottom: "1rem", display: "inline-flex" }}
                            >
                                The Process
                            </span>
                            <h2
                                style={{
                                    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                                    marginTop: "0.75rem",
                                }}
                            >
                                How It Works
                            </h2>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
                                gap: "2rem",
                            }}
                        >
                            {STEPS.map((step) => (
                                <div key={step.step} style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            width: "3.5rem",
                                            height: "3.5rem",
                                            borderRadius: "50%",
                                            background:
                                                "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.1rem",
                                            fontWeight: 800,
                                            margin: "0 auto 1.25rem",
                                        }}
                                    >
                                        {step.step}
                                    </div>
                                    <h3
                                        style={{
                                            fontSize: "1.2rem",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        {step.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.65,
                                            fontSize: "0.95rem",
                                            maxWidth: "22rem",
                                            margin: "0 auto",
                                        }}
                                    >
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== TESTIMONIALS ===== */}
                <section style={{ padding: "6rem 0" }}>
                    <div className="section-container">
                        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                            <span
                                className="badge"
                                style={{ marginBottom: "1rem", display: "inline-flex" }}
                            >
                                Success Stories
                            </span>
                            <h2
                                style={{
                                    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                                    marginTop: "0.75rem",
                                }}
                            >
                                What Operators Are Saying
                            </h2>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
                                gap: "1.5rem",
                            }}
                        >
                            {TESTIMONIALS.map((t) => (
                                <div
                                    key={t.name}
                                    className="glass-card"
                                    style={{ padding: "2rem" }}
                                >
                                    <div
                                        style={{
                                            fontSize: "1.75rem",
                                            marginBottom: "1rem",
                                            opacity: 0.3,
                                        }}
                                    >
                                        &ldquo;
                                    </div>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                            lineHeight: 1.7,
                                            fontSize: "0.95rem",
                                            marginBottom: "1.5rem",
                                        }}
                                    >
                                        {t.quote}
                                    </p>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                                            {t.name}
                                        </div>
                                        <div
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "0.825rem",
                                                marginTop: "0.15rem",
                                            }}
                                        >
                                            {t.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== CTA FOOTER ===== */}
                <section
                    style={{
                        padding: "6rem 0",
                        borderTop: "1px solid var(--border-subtle)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Background glow */}
                    <div
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            bottom: "-20%",
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

                    <div
                        className="section-container"
                        style={{
                            textAlign: "center",
                            position: "relative",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                                marginBottom: "1rem",
                            }}
                        >
                            Ready to Get Started?
                        </h2>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                maxWidth: "30rem",
                                margin: "0 auto 2rem",
                                fontSize: "1.05rem",
                            }}
                        >
                            Complete your qualification and unlock access to the full Cash Offer
                            Conversion School platform.
                        </p>
                        <TrackedCta href="/register" className="btn-primary" ctaId="footer_register" ctaText="Start Your Qualification" section="cta_footer">
                            Start Your Qualification →
                        </TrackedCta>
                    </div>
                </section>
            </main>

            {/* ===== FOOTER ===== */}
            <footer
                style={{
                    borderTop: "1px solid var(--border-subtle)",
                    padding: "2rem 0",
                }}
            >
                <div
                    className="section-container"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "1rem",
                        color: "var(--text-muted)",
                        fontSize: "0.825rem",
                    }}
                >
                    <span>© 2026 Cash Offer Conversion School. All rights reserved.</span>
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                        <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                            Privacy
                        </a>
                        <a href="#" style={{ color: "var(--text-muted)", textDecoration: "none" }}>
                            Terms
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
