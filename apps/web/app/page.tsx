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
            <nav className="nav-bar">
                <div className="section-container nav-inner">
                    <Link href="/" className="nav-logo">
                        <span className="nav-logo-icon">🏠</span>
                        COCS
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="btn-ghost py-2 px-5 text-sm"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="btn-primary py-2 px-5 text-sm"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* ===== HERO ===== */}
                <section className="hero-section">
                    <div aria-hidden="true" className="hero-glow" />

                    <div className="animate-fade-in-up relative">
                        <span className="badge mb-6">● Now Open for Operators</span>
                    </div>

                    <h1 className="animate-fade-in-up animate-delay-100 hero-title">
                        Master Cash Offer{" "}
                        <span className="text-gradient-brand">Lead Generation</span>
                    </h1>

                    <p className="animate-fade-in-up animate-delay-200 hero-subtitle">
                        The complete system to build and operate a cash offer lead business.
                        Education. Qualification. Conversion.
                    </p>

                    <div className="animate-fade-in-up animate-delay-300 flex flex-wrap justify-center gap-4 relative">
                        <TrackedCta href="/register" className="btn-primary" ctaId="hero_register" ctaText="Start Your Qualification" section="hero">
                            Start Your Qualification →
                        </TrackedCta>
                        <a href="#how-it-works" className="btn-ghost">
                            See How It Works
                        </a>
                    </div>

                    <div className="animate-fade-in-up animate-delay-500 trust-bar relative">
                        <span>✓ No upfront costs</span>
                        <span>✓ Structured curriculum</span>
                        <span>✓ Expert coaching</span>
                    </div>
                </section>

                {/* ===== VALUE PROPOSITIONS ===== */}
                <section className="section-padded section-bordered-top">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">Why COCS</span>
                            <h2 className="section-heading">Three Pillars of Success</h2>
                            <p className="text-[color:var(--text-secondary)] max-w-lg mx-auto mt-4 text-lg">
                                Everything you need to go from beginner to qualified operator.
                            </p>
                        </div>

                        <div className="grid-auto-fit">
                            {VALUE_PROPS.map((prop) => (
                                <div key={prop.title} className="glass-card p-8">
                                    <div
                                        className="icon-box"
                                        style={{ background: `${prop.color}15` }}
                                    >
                                        {prop.icon}
                                    </div>
                                    <h3 className="text-xl mb-3">{prop.title}</h3>
                                    <p className="text-[color:var(--text-secondary)] leading-relaxed text-[0.95rem]">
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
                    className="section-padded section-bg-alt section-bordered-top section-bordered-bottom"
                >
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">The Process</span>
                            <h2 className="section-heading">How It Works</h2>
                        </div>

                        <div className="grid-auto-fit-lg">
                            {STEPS.map((step) => (
                                <div key={step.step} className="text-center">
                                    <div className="step-number">{step.step}</div>
                                    <h3 className="text-xl mb-3">{step.title}</h3>
                                    <p className="text-[color:var(--text-secondary)] leading-relaxed text-[0.95rem] max-w-sm mx-auto">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== TESTIMONIALS ===== */}
                <section className="section-padded">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">Success Stories</span>
                            <h2 className="section-heading">What Operators Are Saying</h2>
                        </div>

                        <div className="grid-auto-fit">
                            {TESTIMONIALS.map((t) => (
                                <div key={t.name} className="glass-card p-8">
                                    <div className="quote-mark">&ldquo;</div>
                                    <p className="text-[color:var(--text-secondary)] leading-relaxed text-[0.95rem] mb-6">
                                        {t.quote}
                                    </p>
                                    <div>
                                        <div className="font-semibold text-[0.95rem]">{t.name}</div>
                                        <div className="text-[color:var(--text-muted)] text-[0.825rem] mt-0.5">
                                            {t.role}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== CTA FOOTER ===== */}
                <section className="section-padded section-bordered-top relative overflow-hidden">
                    <div aria-hidden="true" className="cta-glow" />

                    <div className="section-container text-center relative">
                        <h2 className="section-heading mb-4">Ready to Get Started?</h2>
                        <p className="text-[color:var(--text-secondary)] max-w-md mx-auto mb-8 text-lg">
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
            <footer className="site-footer">
                <div className="section-container footer-inner">
                    <span>© 2026 Cash Offer Conversion School. All rights reserved.</span>
                    <div className="flex gap-6">
                        <a href="#" className="footer-link">Privacy</a>
                        <a href="#" className="footer-link">Terms</a>
                    </div>
                </div>
            </footer>
        </>
    );
}
