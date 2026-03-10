import type { Metadata } from "next";
import Link from "next/link";
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



// ── Section Header ──

function SectionHeader({ badge, heading, sub }: { badge: string; heading: string; sub?: string }) {
    return (
        <div className="text-center space-y-4 mb-12">
            <Badge>{badge}</Badge>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{heading}</h2>
            {sub && (
                <p className="text-[color:var(--text-secondary)] max-w-2xl mx-auto text-base leading-relaxed">
                    {sub}
                </p>
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
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
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
                {/* ═══ 1. HERO ═══ */}
                <section className="relative overflow-hidden py-32 md:py-40">
                    {/* Radial glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                        <div className="w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,transparent_70%)]" />
                    </div>

                    <div className="max-w-6xl mx-auto px-6 text-center relative space-y-8">
                        <Badge className="animate-fade-in-up">● Season 1 — Now Enrolling</Badge>

                        <h1 className="animate-fade-in-up animate-delay-100 text-5xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-[1.1]">
                            The 12-Week System That{" "}
                            <span className="text-gradient-brand">Installs Conversion</span>
                            {" "}Into Your Operation
                        </h1>

                        <p className="animate-fade-in-up animate-delay-200 text-lg text-[color:var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
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

                        <div className="animate-fade-in-up animate-delay-500 flex flex-wrap justify-center gap-6 text-sm text-[color:var(--text-muted)]">
                            <span>✓ 12 weeks, live</span>
                            <span>✓ Real operators, not theory</span>
                            <span>✓ Install and keep the systems</span>
                        </div>
                    </div>
                </section>

                {/* ═══ 2. CATEGORY SHIFT ═══ */}
                <section className="py-24 bg-[var(--bg-secondary)]">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="The Problem"
                            heading="This Isn't Another Lead Gen Course"
                            sub={'Most training teaches you how to buy leads. None of it teaches you how to convert them. The gap between \u201Clead received\u201D and \u201Ccontract signed\u201D is where teams fail \u2014 and where revenue dies.'}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: "📉", title: "Courses Teach Theory", body: "They hand you information and leave. No systems, no scripts, no accountability for whether your team actually improves." },
                                { icon: "🔧", title: "This Installs Systems", body: "Every week you install a specific conversion system into your operation. Scripts, SOPs, and live coaching to make sure it sticks." },
                                { icon: "🎯", title: "Operators, Not Gurus", body: "Every guest has a live operation. They're closing deals this month, not teaching from a stage." },
                            ].map((c) => (
                                <Card key={c.title} className="text-center">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="text-4xl">{c.icon}</div>
                                        <h3 className="text-xl font-semibold">{c.title}</h3>
                                        <p className="text-[color:var(--text-secondary)] text-base leading-relaxed">{c.body}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 3. WHY TEAMS LEAK LEADS ═══ */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="The Leak"
                            heading="Why Your Team Leaks Leads"
                            sub={'You\u2019re spending money on leads. Your team is \u201Cworking\u201D them. But the conversion rate tells the real story.'}
                        />

                        <div className="max-w-3xl mx-auto space-y-5">
                            {[
                                { icon: "🕐", label: "Slow speed to lead — the first 5 minutes matter more than the first 5 days" },
                                { icon: "📞", label: "No call script — reps improvise every call and wonder why results vary" },
                                { icon: "🏠", label: "Weak appointment structure — sellers don't feel confident in your process" },
                                { icon: "💰", label: "Offers that don't land — you second-guess comps, miss repair estimates, or underbid" },
                                { icon: "📭", label: "No follow-up system — leads go cold because nobody owns the nurture pipeline" },
                            ].map((leak) => (
                                <div key={leak.label} className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-xl shrink-0">{leak.icon}</div>
                                    <p className="text-[color:var(--text-secondary)] text-base leading-relaxed pt-2">{leak.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 4. 12-WEEK SYSTEM ═══ */}
                <section id="system" className="py-24 bg-[var(--bg-secondary)]">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="The System"
                            heading="12 Weeks. 4 Modules. Installed."
                            sub="Each week covers one piece of the conversion system. By week 12, your team has a complete, battle-tested playbook."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {MODULES.map((mod) => (
                                <Card key={mod.number}>
                                    <CardContent className="p-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dark)] flex items-center justify-center font-bold text-white text-lg">
                                                {mod.number}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">{mod.title}</h3>
                                                <span className="text-xs text-[color:var(--text-muted)]">{mod.weeks} • {mod.episodes} episodes</span>
                                            </div>
                                        </div>
                                        <p className="text-[color:var(--text-secondary)] text-base leading-relaxed">{mod.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 5. INSTALLATION TIMELINE ═══ */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="Inside the Program"
                            heading="What You'll Install Each Week"
                        />

                        <div className="max-w-2xl mx-auto relative">
                            {/* Timeline spine */}
                            <div
                                className="absolute left-[23px] top-0 bottom-0 w-px"
                                style={{ background: 'linear-gradient(to bottom, var(--brand-orange), var(--border-subtle))' }}
                                aria-hidden="true"
                            />

                            <div className="space-y-10">
                                {MODULES.map((mod) => (
                                    <div key={mod.number} className="relative">
                                        {/* Module marker */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dark)] flex items-center justify-center font-bold text-white text-lg relative z-10">
                                                {mod.number}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold">{mod.title}</h3>
                                                <span className="text-xs text-[color:var(--text-muted)]">{mod.weeks}</span>
                                            </div>
                                        </div>

                                        {/* Episodes */}
                                        <div className="ml-[47px] space-y-0">
                                            {Array.from({ length: mod.episodes }, (_, i) => {
                                                const epNum = (Number(mod.number) - 1) * 3 + i + 1;
                                                return (
                                                    <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--border-subtle)] last:border-b-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)] shrink-0" />
                                                        <span className="text-sm font-medium flex-1">Episode {epNum}</span>
                                                        <span className="text-xs text-[color:var(--text-muted)]">Guest Operator (TBA)</span>
                                                        <Badge variant="outline" className="text-xs">Week {epNum}</Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══ 6. GUEST OPERATORS ═══ */}
                <section className="py-24 bg-[var(--bg-secondary)]">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="Real Operators"
                            heading="Every Guest Has a Live Operation"
                            sub="No talking heads. No motivational speakers. Every guest operator is actively closing cash offer deals — this month, not last year."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            {[
                                { icon: "🎙️", label: "Operators who run their own disposition desks" },
                                { icon: "📊", label: "Teams converting 50+ leads per month" },
                                { icon: "🏗️", label: "Founders who built their operation from scratch" },
                            ].map((item) => (
                                <Card key={item.label} className="text-center">
                                    <CardContent className="p-6 space-y-3">
                                        <div className="text-3xl">{item.icon}</div>
                                        <p className="text-[color:var(--text-secondary)] text-base leading-relaxed">{item.label}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 7. WHAT YOU RECEIVE ═══ */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="What's Included"
                            heading="What You Receive"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {DELIVERABLES.map((d) => (
                                <Card key={d.title}>
                                    <CardContent className="p-6 space-y-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-xl">{d.icon}</div>
                                        <h3 className="text-xl font-semibold">{d.title}</h3>
                                        <p className="text-[color:var(--text-secondary)] text-base leading-relaxed">{d.detail}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ 8. PRIMARY CTA ═══ */}
                <section className="py-24 bg-[var(--bg-secondary)] relative overflow-hidden">
                    {/* Glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                        <div className="w-[30rem] h-[30rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08)_0%,transparent_70%)]" />
                    </div>

                    <div className="max-w-6xl mx-auto px-6 text-center relative space-y-6">
                        <Badge>Limited Seats</Badge>
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to Install a Real Conversion System?</h2>
                        <p className="text-[color:var(--text-secondary)] max-w-lg mx-auto text-base leading-relaxed">
                            Season 1 has limited seats. Save yours now and get a personalized
                            conversion audit before the program begins.
                        </p>
                        <div className="pt-4">
                            <TrackedCta href="/register" className="btn-primary text-lg px-10 py-4 rounded-xl" ctaId="audit_cta_save_seat" ctaText="Save My Seat for Season 1" section="audit_cta">
                                Save My Seat for Season 1
                            </TrackedCta>
                        </div>
                    </div>
                </section>

                {/* ═══ 9. FAQ ═══ */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-6 space-y-8">
                        <SectionHeader
                            badge="FAQ"
                            heading="Common Questions"
                        />

                        <div className="max-w-3xl mx-auto">
                            <FaqAccordion />
                        </div>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="border-t border-[var(--border-subtle)] py-8">
                <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-[color:var(--text-muted)]">
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
