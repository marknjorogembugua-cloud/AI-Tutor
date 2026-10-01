import Link from 'next/link';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { FOOTER_COLUMNS, SiteFooter } from '@/components/SiteChrome';
import { InlineTrust, PrivacyNote, Reveal, TrustStrip } from '@/components/Trust';
import { CURRICULUM, CURRICULUM_STATS } from '@/lib/curriculum.generated';

const STEPS = [
    { t: 'Assess', d: 'A short diagnostic finds exactly where your child is, so nothing starts from zero guesses.' },
    { t: 'Adapt', d: 'Difficulty, hints, and explanations adjust in real time to what they actually need next.' },
    { t: 'Teach', d: 'Hints before answers. Concepts before shortcuts. The why, not just the what.' },
    { t: 'Track', d: 'Progress, gaps, and next steps in language a parent can actually read.' },
];

const TRUST = [
    { title: 'Private by default', body: 'Every answer belongs to one student and their linked parent account. Nothing is shared or sold.' },
    { title: 'Locked down in the database', body: 'Row-level security means the database itself refuses any account from reading another child.' },
    { title: 'No ads, ever', body: 'No third-party trackers, no behavioural profiling, no ad networks in the product.' },
    { title: 'Yours to leave', body: 'Request deletion of your account and data at any time — no retention maze.' },
];

const PARENT = [
    { t: 'Clear progress', d: 'Strengths, gaps, and time spent — described in plain language.' },
    { t: 'Real insight', d: 'See what your child actually practised and where they struggled.' },
    { t: 'Next steps', d: 'A weekly recommendation, not a wall of statistics.' },
];

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
                <div className="shell flex h-16 items-center justify-between gap-4">
                    <Logo />
                    <nav className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/#how"
                            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition duration-200 ease-smooth hover:bg-surface-muted hover:text-ink sm:inline-block"
                        >
                            How it works
                        </Link>
                        <Link
                            href="/subjects"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition duration-200 ease-smooth hover:bg-surface-muted hover:text-ink"
                        >
                            Subjects
                        </Link>
                        <Link
                            href="/pricing"
                            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition duration-200 ease-smooth hover:bg-surface-muted hover:text-ink sm:inline-block"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/login"
                            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition duration-200 ease-smooth hover:bg-surface-muted hover:text-ink sm:inline-block"
                        >
                            Log in
                        </Link>
                        <ThemeSwitcher compact />
                        <Link href="/signup" className="btn-primary ml-1 text-sm">
                            Start Learning
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="relative overflow-hidden border-b border-line bg-aurora">
                    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
                    <div className="shell relative py-20 sm:py-28">
                        <div className="mx-auto max-w-3xl text-center">
                            <Reveal>
                                <span className="chip bg-brand-soft text-brand-ink ring-1 ring-inset ring-brand-line">
                                    Adaptive AI tutoring
                                </span>
                            </Reveal>
                            <Reveal delay={60}>
                                <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-6xl">
                                    A tutor that learns how{' '}
                                    <span className="text-brand">your child</span> learns.
                                </h1>
                            </Reveal>
                            <Reveal delay={120}>
                                <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft">
                                    Personalised tutoring that adapts in real time to your child&apos;s
                                    strengths, gaps, pace, and learning style — in a space built around
                                    privacy.
                                </p>
                            </Reveal>
                            <Reveal delay={180}>
                                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                    <Link href="/signup" className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
                                        Start Learning
                                    </Link>
                                    <a href="#how" className="btn-outline w-full px-6 py-3 text-base sm:w-auto">
                                        See How It Works
                                    </a>
                                </div>
                            </Reveal>
                            <Reveal delay={240}>
                                <InlineTrust
                                    className="mt-8 justify-center"
                                    items={[
                                        'No ads or trackers',
                                        'Row-level security',
                                        'Parent-only visibility',
                                    ]}
                                />
                            </Reveal>
                        </div>
                    </div>
                </section>

                <section className="border-b border-line bg-surface-card">
                    <div className="shell py-16">
                        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                            <div className="max-w-2xl">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                                    {CURRICULUM_STATS.topics} topics ·{' '}
                                    {CURRICULUM_STATS.skills} skills
                                </p>
                                <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                                    {CURRICULUM_STATS.subjects} subjects, from arithmetic to
                                    astrophysics.
                                </h2>
                                <p className="mt-4 text-pretty leading-relaxed text-ink-soft">
                                    Core subjects, modern skills and a wide spread of languages.
                                    Every one of them gets the same adaptive tutor.
                                </p>
                            </div>
                            <Link href="/subjects" className="btn-outline shrink-0">
                                Browse all subjects
                            </Link>
                        </div>

                        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {CURRICULUM.slice(0, 8).map((s) => (
                                <li key={s.id} className="card flex items-center gap-3 p-4">
                                    <span aria-hidden className="text-xl leading-none">
                                        {s.emoji}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-medium text-ink">
                                            {s.name}
                                        </span>
                                        <span className="text-xs text-ink-mute">
                                            {s.topics.length} topics
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section id="how" className="shell py-20">
                    <SectionHeading
                        eyebrow="How it works"
                        title="Four steps, repeated until it sticks"
                        description="Each session starts from what the tutor already knows about your child, not from the beginning."
                    />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((s, i) => (
                            <Card key={s.t} interactive className="animate-fade-up" >
                                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-sm font-semibold text-brand-ink">
                                    {i + 1}
                                </div>
                                <h3 className="font-semibold text-ink">{s.t}</h3>
                                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-mute">{s.d}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="border-y border-line bg-surface-card">
                    <div className="shell grid items-center gap-12 py-20 md:grid-cols-2">
                        <div>
                            <h2 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                                Every student learns differently.
                            </h2>
                            <p className="mt-4 text-pretty leading-relaxed text-ink-soft">
                                Generic chatbots answer questions. A real tutor notices <em>why</em> a
                                student got something wrong — then teaches that. Ours does the same, and
                                remembers it next time.
                            </p>
                            <PrivacyNote className="mt-8">
                                The tutor sees answers to tailor a lesson. That conversation stays between
                                the student, their linked parent, and the tutor.
                            </PrivacyNote>
                        </div>
                        <Card className="text-sm">
                            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-ink-mute">
                                Example misconception detected
                            </p>
                            <div className="space-y-3">
                                <p>
                                    <span className="text-ink-mute">Q:</span> What is 1/2 + 1/4?
                                </p>
                                <p>
                                    <span className="text-ink-mute">Student:</span> 2/6
                                </p>
                                <p className="rounded-xl bg-brand-soft/70 px-3 py-2 text-brand-ink">
                                    Tutor: &quot;You&apos;re on the right track. Let&apos;s look at the
                                    bottom numbers first…&quot;
                                </p>
                            </div>
                        </Card>
                    </div>
                </section>

                <section className="shell py-20">
                    <SectionHeading
                        eyebrow="Privacy &amp; trust"
                        title="Built so parents can actually trust it"
                        description="Confidentiality is a product feature here, not a policy page we added later."
                    />
                    <TrustStrip items={TRUST} />

                    <div className="mt-10 grid gap-4 lg:grid-cols-3">
                        {PARENT.map((c) => (
                            <Card key={c.t} interactive>
                                <h3 className="font-semibold text-ink">{c.t}</h3>
                                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-mute">
                                    {c.d}
                                </p>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-4">
                        <p className="text-center text-sm text-ink-mute">
                            Start free, upgrade when you&apos;re ready.{' '}
                            <Link href="/pricing" className="font-medium text-brand-ink hover:underline">
                                See full plan details
                            </Link>
                        </p>
                        <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                            Create a free account
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter columns={FOOTER_COLUMNS} />
        </div>
    );
}
