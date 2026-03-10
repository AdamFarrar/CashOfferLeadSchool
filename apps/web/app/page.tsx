import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { TrackedCta } from "./components/TrackedCta";
import { FaqAccordion } from "./components/FaqAccordion";
import { Card, CardContent, Badge } from "@cocs/ui";

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

// ── Data ──

const MODULES = [
    {
        number: "01",
        title: "Convert for the Appointment",
        description: "First-contact scripts, speed-to-lead systems, and the psychology of booking solid appointments from inbound leads.",
        weeks: "Weeks 1–3",
        episodes: 3,
        image: "/images/operator-phone.png",
    },
    {
        number: "02",
        title: "The Appointment",
        description: "How to run appointments that build trust, uncover motivation, and position your cash offer as the obvious solution.",
        weeks: "Weeks 4–6",
        episodes: 3,
        image: "/images/team-strategy.png",
    },
    {
        number: "03",
        title: "Offer Mechanics",
        description: "Structuring offers that work for sellers and protect your margin. Comps, repair estimates, and creative deal structures.",
        weeks: "Weeks 7–9",
        episodes: 3,
        image: "/images/whiteboard-planning.png",
    },
    {
        number: "04",
        title: "Nurture",
        description: "The follow-up systems that convert cold leads over time. Drip sequences, re-engagement campaigns, and pipeline management.",
        weeks: "Weeks 10–12",
        episodes: 3,
        image: "/images/operator-crm.png",
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

const OPERATORS = [
    { name: "Marcus Rivera", line: "Closes 40+ deals per year", image: "/images/hero-operator.png" },
    { name: "Sarah Chen", line: "Runs a six-figure dispositions desk", image: "/images/team-strategy.png" },
    { name: "James Mitchell", line: "Specializes in off-market acquisitions", image: "/images/operator-closing.png" },
    { name: "Danielle Brooks", line: "Built a 3-person conversion team from scratch", image: "/images/whiteboard-planning.png" },
];

// ── Section Header ──

function SectionHeader({ badge, heading, sub }: { badge: string; heading: string; sub?: string }) {
    return (
        <div className="mc-section-header">
            <Badge>{badge}</Badge>
            <h2>{heading}</h2>
            {sub && (
                <p>{sub}</p>
            )}
        </div>
    );
}

// ── Page ──

export default function LandingPage() {
    return (
        <>
            {/* ── NAV (sticky) ── */}
            <nav className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(5,5,5,0.7)] backdrop-blur-xl">
                <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-lg" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dark)] flex items-center justify-center text-sm">🏠</span>
                        COCS
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="btn-ghost py-2 px-5 text-sm">Log In</Link>
                        <Link href="/register" className="btn-primary py-2 px-5 text-sm">Save My Seat</Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* ═══ 1. CINEMATIC HERO ═══ */}
                <section className="cinematic-hero">
                    {/* Background image */}
                    <div className="cinematic-hero-bg">
                        <Image
                            src="/images/hero-operator.png"
                            alt="Real estate operator reviewing deal pipeline"
                            fill
                            priority
                            sizes="100vw"
                            style={{ objectFit: "cover", objectPosition: "center top" }}
                        />
                    </div>

                    {/* Dark gradient overlay */}
                    <div className="cinematic-hero-overlay" aria-hidden="true" />

                    <div className="cinematic-hero-content space-y-8">
                        <Badge className="animate-fade-in-up">● Season 1 — Now Enrolling</Badge>

                        <h1 className="animate-fade-in-up animate-delay-100 max-w-[900px] mx-auto leading-[1.1]">
                            The 12-Week System That{" "}
                            <span className="text-gradient-brand">Installs Conversion</span>
                            {" "}Into Your Operation
                        </h1>

                        <p className="animate-fade-in-up animate-delay-200 text-lg max-w-[650px] mx-auto leading-relaxed" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text-secondary)" }}>
                            Stop guessing why leads don&apos;t close. Install the scripts, systems,
                            and operator habits that turn cash offer leads into signed contracts.
                        </p>

                        <div className="animate-fade-in-up animate-delay-300 flex flex-wrap justify-center gap-4 mt-8">
                            <TrackedCta href="/register" className="btn-primary text-lg px-8 py-3.5 rounded-xl" ctaId="hero_save_seat" ctaText="Save My Seat for Season 1" section="hero">
                                Save My Seat for Season 1
                            </TrackedCta>
                            <a href="#system" className="btn-ghost text-lg px-8 py-3.5 rounded-xl">
                                See the System
                            </a>
                        </div>

                        <div className="animate-fade-in-up animate-delay-500 flex flex-wrap justify-center gap-6 text-sm mt-4" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text-muted)" }}>
                            <span>✓ 12 weeks, live</span>
                            <span>✓ Real operators, not theory</span>
                            <span>✓ Install and keep the systems</span>
                        </div>
                    </div>
                </section>

                {/* ═══ 1.5 OPERATOR CREDIBILITY STRIP ═══ */}
                <section className="credibility-strip">
                    <div className="credibility-grid">
                        {OPERATORS.map((op) => (
                            <div key={op.name} className="credibility-card">
                                <div className="credibility-avatar">
                                    <Image
                                        src={op.image}
                                        alt={op.name}
                                        width={100}
                                        height={100}
                                        style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                    />
                                </div>
                                <span className="credibility-name">{op.name}</span>
                                <span className="credibility-line">&ldquo;{op.line}&rdquo;</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ═══ 2. CATEGORY SHIFT (Editorial) ═══ */}
                <section className="py-[100px]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="The Problem"
                            heading="This Isn't Another Lead Gen Course"
                            sub={'Most training teaches you how to buy leads. None of it teaches you how to convert them. The gap between \u201Clead received\u201D and \u201Ccontract signed\u201D is where teams fail \u2014 and where revenue dies.'}
                        />

                        <div className="space-y-16">
                            {/* Editorial Row 1 — Image left, text right */}
                            <div className="editorial-row">
                                <div className="editorial-image">
                                    <Image
                                        src="/images/whiteboard-planning.png"
                                        alt="Whiteboard conversion planning session"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="editorial-text">
                                    <Badge>Why Courses Fail</Badge>
                                    <h3>Courses Teach Theory. This Installs Systems.</h3>
                                    <p>They hand you information and leave. No systems, no scripts, no accountability for whether your team actually improves. Every week you install a specific conversion system into your operation.</p>
                                </div>
                            </div>

                            {/* Editorial Row 2 — Text left, image right */}
                            <div className="editorial-row reverse">
                                <div className="editorial-image">
                                    <Image
                                        src="/images/operator-closing.png"
                                        alt="Operator closing a deal"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        style={{ objectFit: "cover" }}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="editorial-text">
                                    <Badge>Real Operators</Badge>
                                    <h3>Operators, Not Gurus</h3>
                                    <p>Every guest has a live operation. They&apos;re closing deals this month, not teaching from a stage. Scripts, SOPs, and live coaching to make sure it sticks.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ 3. WHY TEAMS LEAK LEADS (Editorial) ═══ */}
                <section className="py-[100px] bg-[var(--bg-secondary)]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="The Leak"
                            heading="Why Your Team Leaks Leads"
                            sub={'You\u2019re spending money on leads. Your team is \u201Cworking\u201D them. But the conversion rate tells the real story.'}
                        />

                        <div className="editorial-row">
                            <div className="editorial-image">
                                <Image
                                    src="/images/operator-crm.png"
                                    alt="Operator reviewing CRM pipeline"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    style={{ objectFit: "cover" }}
                                    loading="lazy"
                                />
                            </div>
                            <div className="editorial-text">
                                <div className="space-y-5">
                                    {[
                                        { icon: "🕐", label: "Slow speed to lead — the first 5 minutes matter more than the first 5 days" },
                                        { icon: "📞", label: "No call script — reps improvise every call and wonder why results vary" },
                                        { icon: "🏠", label: "Weak appointment structure — sellers don't feel confident in your process" },
                                        { icon: "💰", label: "Offers that don't land — you second-guess comps, miss repair estimates, or underbid" },
                                        { icon: "📭", label: "No follow-up system — leads go cold because nobody owns the nurture pipeline" },
                                    ].map((leak) => (
                                        <div key={leak.label} className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-xl shrink-0">{leak.icon}</div>
                                            <p className="text-base leading-relaxed pt-2" style={{ color: "var(--text-secondary)", fontFamily: "'Inter', system-ui, sans-serif" }}>{leak.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ 4. 12-WEEK SYSTEM (Cinematic Module Preview) ═══ */}
                <section id="system" className="py-[100px]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="The System"
                            heading="12 Weeks. 4 Modules. Installed."
                            sub="Each week covers one piece of the conversion system. By week 12, your team has a complete, battle-tested playbook."
                        />

                        <div className="space-y-4 max-w-[900px] mx-auto">
                            {MODULES.map((mod) => (
                                <div key={mod.number} className="module-preview-card">
                                    <div className="module-preview-image">
                                        <Image
                                            src={mod.image}
                                            alt={mod.title}
                                            fill
                                            sizes="200px"
                                            style={{ objectFit: "cover" }}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="module-preview-number">{mod.number}</span>
                                            <div>
                                                <h3 className="text-xl" style={{ fontWeight: 600 }}>{mod.title}</h3>
                                                <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Inter', system-ui, sans-serif" }}>{mod.weeks} • {mod.episodes} episodes</span>
                                            </div>
                                        </div>
                                        <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "'Inter', system-ui, sans-serif" }}>{mod.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 5. INSTALLATION TIMELINE (Visual Timeline) ═══ */}
                <section className="py-[100px] bg-[var(--bg-secondary)]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="Inside the Program"
                            heading="What You'll Install Each Week"
                        />

                        <div className="timeline-container">
                            <div className="timeline-spine" aria-hidden="true" />

                            {MODULES.map((mod) => (
                                <div key={mod.number} className="timeline-module">
                                    <div className="timeline-marker">{mod.number}</div>
                                    <h3 className="timeline-module-title">{mod.title}</h3>
                                    <span className="timeline-module-weeks">{mod.weeks}</span>

                                    <div className="timeline-episodes">
                                        {Array.from({ length: mod.episodes }, (_, i) => {
                                            const epNum = (Number(mod.number) - 1) * 3 + i + 1;
                                            return (
                                                <div key={i} className="timeline-episode">
                                                    <div className="timeline-episode-dot" />
                                                    <span className="timeline-episode-label">
                                                        Week {epNum} &mdash; <span className="timeline-episode-sub">{mod.title}</span>
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 6. GUEST OPERATORS ═══ */}
                <section className="py-[100px]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="Real Operators"
                            heading="Every Guest Has a Live Operation"
                            sub="No talking heads. No motivational speakers. Every guest operator is actively closing cash offer deals — this month, not last year."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
                            {[
                                { icon: "🎙️", label: "Operators who run their own disposition desks" },
                                { icon: "📊", label: "Teams converting 50+ leads per month" },
                                { icon: "🏗️", label: "Founders who built their operation from scratch" },
                            ].map((item) => (
                                <Card key={item.label} className="text-center shadow-sm">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="text-3xl">{item.icon}</div>
                                        <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "'Inter', system-ui, sans-serif" }}>{item.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 7. WHAT YOU RECEIVE ═══ */}
                <section className="py-[100px] bg-[var(--bg-secondary)]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="What's Included"
                            heading="What You Receive"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {DELIVERABLES.map((d) => (
                                <Card key={d.title} className="shadow-sm">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-card)] flex items-center justify-center text-xl">{d.icon}</div>
                                        <h3 className="text-xl" style={{ fontWeight: 600 }}>{d.title}</h3>
                                        <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "'Inter', system-ui, sans-serif" }}>{d.detail}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 8. PRIMARY CTA ═══ */}
                <section className="py-[100px] relative overflow-hidden">
                    {/* Cinematic background */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/operator-closing.png"
                            alt=""
                            fill
                            sizes="100vw"
                            style={{ objectFit: "cover", opacity: 0.15 }}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[var(--bg-primary)]" style={{ opacity: 0.85 }} />
                    </div>

                    <div className="max-w-[1100px] mx-auto px-6 text-center relative z-10 space-y-6">
                        <h2 className="text-[40px] md:text-[48px] font-bold tracking-tight max-w-[700px] mx-auto leading-[1.1]">
                            Ready to Install a Real Conversion System?
                        </h2>
                        <p className="max-w-[650px] mx-auto text-lg leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                            Season 1 has limited seats. Save yours now and get a personalized
                            conversion audit before the program begins.
                        </p>
                        <div className="pt-6">
                            <TrackedCta href="/register" className="btn-primary text-lg px-10 py-5 rounded-xl font-bold" ctaId="audit_cta_save_seat" ctaText="Save My Seat for Season 1" section="audit_cta">
                                Save My Seat for Season 1
                            </TrackedCta>
                        </div>
                    </div>
                </section>

                {/* ═══ 9. FAQ ═══ */}
                <section className="py-[100px] bg-[var(--bg-secondary)]">
                    <div className="max-w-[1100px] mx-auto px-6">
                        <SectionHeader
                            badge="FAQ"
                            heading="Common Questions"
                        />

                        <div className="max-w-[700px] mx-auto">
                            <FaqAccordion />
                        </div>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t border-[var(--border-subtle)] py-8">
                <div className="max-w-[1100px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm" style={{ color: "var(--text-muted)", fontFamily: "'Inter', system-ui, sans-serif" }}>
                    <span>&copy; 2026 Cash Offer Conversion School. All rights reserved.</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[color:var(--text-primary)] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[color:var(--text-primary)] transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </>
    );
}
