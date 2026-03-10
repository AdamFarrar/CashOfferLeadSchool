import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCta } from "./components/TrackedCta";

export const metadata: Metadata = {
    title: "Cash Offer Conversion School — 12-Week Installation System for Operators",
    description:
        "The 12-week installation system that trains your team to convert cash offer leads into closed deals. Live sessions, proven scripts, real operators. Save your seat for Season 1.",
    openGraph: {
        title: "Cash Offer Conversion School — Season 1",
        description:
            "A 12-week installation system for cash offer teams. Live sessions. Real operators. Proven conversion systems.",
        type: "website",
    },
};

// ── Module Data ──
const MODULES = [
    {
        number: "01",
        title: "Convert for the Appointment",
        description: "First-contact scripts, speed-to-lead systems, and the psychology of booking solid appointments from inbound leads.",
        weeks: "Weeks 1–3",
        episodes: 3,
    },
    {
        number: "02",
        title: "The Appointment",
        description: "How to run appointments that build trust, uncover motivation, and position your cash offer as the obvious solution.",
        weeks: "Weeks 4–6",
        episodes: 3,
    },
    {
        number: "03",
        title: "Offer Mechanics",
        description: "Structuring offers that work for sellers and protect your margin. Comps, repair estimates, and creative deal structures.",
        weeks: "Weeks 7–9",
        episodes: 3,
    },
    {
        number: "04",
        title: "Nurture",
        description: "The follow-up systems that convert cold leads over time. Drip sequences, re-engagement campaigns, and pipeline management.",
        weeks: "Weeks 10–12",
        episodes: 3,
    },
];

const DELIVERABLES = [
    { icon: "🎬", title: "12 Weekly Episodes", detail: "One per week, with a guest operator who's done it" },
    { icon: "📞", title: "Live Weekly Sessions", detail: "Real-time Q&A and deal breakdowns with the cohort" },
    { icon: "📥", title: "Downloadable Assets", detail: "Scripts, checklists, SOPs — ready to install in your operation" },
    { icon: "📋", title: "Conversion Audit", detail: "A personalized review of your current pipeline and close rate" },
    { icon: "👥", title: "Operator Community", detail: "Discussion threads, notes, and shared wins with your cohort" },
    { icon: "🔁", title: "Replay Access", detail: "Every session recorded — revisit any module at your own pace" },
];

const FAQS = [
    {
        q: "Who is this for?",
        a: "Operators and teams running — or planning to run — a cash offer lead generation and conversion business. If you're buying leads, running a disposition desk, or want to start, this is built for you.",
    },
    {
        q: "What's the time commitment?",
        a: "One episode per week plus a live session. Plan for 2–3 hours per week. Everything is recorded if you miss a session.",
    },
    {
        q: "Is this a course or a coaching program?",
        a: "Neither. It's an installation system. You install proven conversion systems into your operation over 12 weeks with live support from operators who've done it.",
    },
    {
        q: "Do I need experience?",
        a: "Some familiarity with real estate or lead generation is helpful, but not required. The qualification form helps us tailor the experience to your level.",
    },
    {
        q: "What happens after the 12 weeks?",
        a: "You keep replay access and your downloads. Graduates also get access to advanced audit reviews and future seasons.",
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
                            Save My Seat
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* ===== 1. HERO ===== */}
                <section className="hero-section">
                    <div aria-hidden="true" className="hero-glow" />

                    <div className="animate-fade-in-up relative">
                        <span className="badge mb-6">● Season 1 — Now Enrolling</span>
                    </div>

                    <h1 className="animate-fade-in-up animate-delay-100 hero-title">
                        The 12-Week System That{" "}
                        <span className="text-gradient-brand">Installs Conversion</span>
                        {" "}Into Your Operation
                    </h1>

                    <p className="animate-fade-in-up animate-delay-200 hero-subtitle">
                        Stop guessing why leads don&apos;t close. Install the scripts, systems,
                        and operator habits that turn cash offer leads into signed contracts.
                    </p>

                    <div className="animate-fade-in-up animate-delay-300 flex flex-wrap justify-center gap-4 relative">
                        <TrackedCta href="/register" className="btn-primary" ctaId="hero_save_seat" ctaText="Save My Seat for Season 1" section="hero">
                            Save My Seat for Season 1
                        </TrackedCta>
                        <a href="#system" className="btn-ghost">
                            See the System
                        </a>
                    </div>

                    <div className="animate-fade-in-up animate-delay-500 trust-bar relative">
                        <span>✓ 12 weeks, live</span>
                        <span>✓ Real operators, not theory</span>
                        <span>✓ Install and keep the systems</span>
                    </div>
                </section>

                {/* ===== 2. CATEGORY SHIFT ===== */}
                <section className="section-padded section-bordered-top">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">The Problem</span>
                            <h2 className="section-heading">This Isn&apos;t Another Lead Gen Course</h2>
                            <p className="text-[color:var(--text-secondary)] max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
                                Most training teaches you how to buy leads. None of it teaches you how to
                                convert them. The gap between &ldquo;lead received&rdquo; and &ldquo;contract signed&rdquo; is where
                                teams fail — and where revenue dies.
                            </p>
                        </div>

                        <div className="grid-auto-fit gap-6">
                            <div className="glass-card p-6 text-center">
                                <div className="text-4xl mb-4">📉</div>
                                <h3 className="text-xl mb-3">Courses Teach Theory</h3>
                                <p className="text-[color:var(--text-secondary)] leading-relaxed text-sm">
                                    They hand you information and leave. No systems, no scripts,
                                    no accountability for whether your team actually improves.
                                </p>
                            </div>
                            <div className="glass-card p-6 text-center">
                                <div className="text-4xl mb-4">🔧</div>
                                <h3 className="text-xl mb-3">This Installs Systems</h3>
                                <p className="text-[color:var(--text-secondary)] leading-relaxed text-sm">
                                    Every week you install a specific conversion system into your operation.
                                    Scripts, SOPs, and live coaching to make sure it sticks.
                                </p>
                            </div>
                            <div className="glass-card p-6 text-center">
                                <div className="text-4xl mb-4">🎯</div>
                                <h3 className="text-xl mb-3">Operators, Not Gurus</h3>
                                <p className="text-[color:var(--text-secondary)] leading-relaxed text-sm">
                                    Every guest has a live operation. They&apos;re closing deals this month,
                                    not teaching from a stage.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== 3. WHY TEAMS LEAK LEADS ===== */}
                <section className="section-padded section-bg-alt section-bordered-top section-bordered-bottom">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">The Leak</span>
                            <h2 className="section-heading">Why Your Team Leaks Leads</h2>
                            <p className="text-[color:var(--text-secondary)] max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
                                You&apos;re spending money on leads. Your team is &ldquo;working&rdquo; them.
                                But the conversion rate tells the real story.
                            </p>
                        </div>

                        <div className="grid-auto-fit-lg max-w-3xl mx-auto">
                            {[
                                { icon: "🕐", label: "Slow speed to lead — the first 5 minutes matter more than the first 5 days" },
                                { icon: "📞", label: "No call script — reps improvise every call and wonder why results vary" },
                                { icon: "🏠", label: "Weak appointment structure — sellers don't feel confident in your process" },
                                { icon: "💰", label: "Offers that don't land — you second-guess comps, miss repair estimates, or underbid" },
                                { icon: "📭", label: "No follow-up system — leads go cold because nobody owns the nurture pipeline" },
                            ].map((leak) => (
                                <div key={leak.label} className="flex items-start gap-4 mb-6">
                                    <div className="icon-box shrink-0">{leak.icon}</div>
                                    <p className="text-[color:var(--text-secondary)] text-sm leading-relaxed">{leak.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== 4. THE 12-WEEK INSTALLATION SYSTEM ===== */}
                <section id="system" className="section-padded section-bordered-bottom">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">The System</span>
                            <h2 className="section-heading">12 Weeks. 4 Modules. Installed.</h2>
                            <p className="text-[color:var(--text-secondary)] max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
                                Each week covers one piece of the conversion system.
                                By week 12, your team has a complete, battle-tested playbook.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {MODULES.map((mod) => (
                                <div key={mod.number} className="glass-card p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="step-number">{mod.number}</div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{mod.title}</h3>
                                            <span className="text-[color:var(--text-muted)] text-xs">{mod.weeks} • {mod.episodes} episodes</span>
                                        </div>
                                    </div>
                                    <p className="text-[color:var(--text-secondary)] leading-relaxed text-sm">
                                        {mod.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== 5. MODULE BREAKDOWN (Episode Preview) ===== */}
                <section className="section-padded section-bg-alt section-bordered-bottom">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">Inside the Program</span>
                            <h2 className="section-heading">What You&apos;ll Install Each Week</h2>
                        </div>

                        <div className="max-w-3xl mx-auto">
                            {MODULES.map((mod) => (
                                <div key={mod.number} className="mb-10">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <span className="text-[color:var(--brand-orange)]">Module {mod.number}</span>
                                        <span className="text-[color:var(--text-muted)]">—</span>
                                        {mod.title}
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        {Array.from({ length: mod.episodes }, (_, i) => (
                                            <div key={i} className="glass-card p-4 flex items-center gap-4">
                                                <div className="icon-box shrink-0 text-sm">🎬</div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-[0.9rem]">
                                                        Episode {(Number(mod.number) - 1) * 3 + i + 1}
                                                    </div>
                                                    <div className="text-[color:var(--text-muted)] text-xs">
                                                        Guest Operator (TBA)
                                                    </div>
                                                </div>
                                                <span className="badge text-xs">Week {(Number(mod.number) - 1) * 3 + i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== 6. GUEST OPERATORS ===== */}
                <section className="section-padded section-bordered-bottom">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">Real Operators</span>
                            <h2 className="section-heading">Every Guest Has a Live Operation</h2>
                            <p className="text-[color:var(--text-secondary)] max-w-2xl mx-auto mt-4 text-lg leading-relaxed">
                                No talking heads. No motivational speakers. Every guest operator is
                                actively closing cash offer deals — this month, not last year.
                            </p>
                        </div>

                        <div className="grid-auto-fit max-w-3xl mx-auto">
                            {[
                                { icon: "🎙️", label: "Operators who run their own disposition desks" },
                                { icon: "📊", label: "Teams converting 50+ leads per month" },
                                { icon: "🏗️", label: "Founders who built their operation from scratch" },
                            ].map((item) => (
                                <div key={item.label} className="glass-card p-6 text-center">
                                    <div className="text-3xl mb-3">{item.icon}</div>
                                    <p className="text-[color:var(--text-secondary)] text-sm leading-relaxed">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== 7. WHAT YOU RECEIVE ===== */}
                <section className="section-padded section-bg-alt section-bordered-top section-bordered-bottom">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">What&apos;s Included</span>
                            <h2 className="section-heading">What You Receive</h2>
                        </div>

                        <div className="grid-auto-fit">
                            {DELIVERABLES.map((d) => (
                                <div key={d.title} className="glass-card p-6">
                                    <div className="icon-box mb-4">{d.icon}</div>
                                    <h3 className="text-lg mb-2 font-semibold">{d.title}</h3>
                                    <p className="text-[color:var(--text-secondary)] text-sm leading-relaxed">
                                        {d.detail}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===== 8. AUDIT CTA ===== */}
                <section className="section-padded section-bordered-bottom relative overflow-hidden">
                    <div aria-hidden="true" className="cta-glow" />

                    <div className="section-container text-center relative">
                        <span className="badge mb-6 inline-flex">Limited Seats</span>
                        <h2 className="section-heading mb-4">Ready to Install a Real Conversion System?</h2>
                        <p className="text-[color:var(--text-secondary)] max-w-lg mx-auto mb-8 text-lg leading-relaxed">
                            Season 1 has limited seats. Save yours now and get a personalized
                            conversion audit before the program begins.
                        </p>
                        <TrackedCta href="/register" className="btn-primary" ctaId="audit_cta_save_seat" ctaText="Save My Seat for Season 1" section="audit_cta">
                            Save My Seat for Season 1
                        </TrackedCta>
                    </div>
                </section>

                {/* ===== 9. FAQ ===== */}
                <section className="section-padded">
                    <div className="section-container">
                        <div className="text-center mb-16">
                            <span className="badge mb-4 inline-flex">FAQ</span>
                            <h2 className="section-heading">Common Questions</h2>
                        </div>

                        <div className="max-w-2xl mx-auto flex flex-col gap-6">
                            {FAQS.map((faq) => (
                                <div key={faq.q} className="glass-card p-6">
                                    <h3 className="text-sm font-semibold mb-2">{faq.q}</h3>
                                    <p className="text-[color:var(--text-secondary)] text-sm leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
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
