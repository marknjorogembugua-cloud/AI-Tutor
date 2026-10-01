import type { Metadata } from 'next';
import Link from 'next/link';
import { FOOTER_COLUMNS, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { Card, SectionHeading } from '@/components/ui/Card';
import { TrustStrip } from '@/components/Trust';
import { PLAN_LIST, FREE_DAILY_QUESTIONS } from '@/lib/billing/plans';
import { CURRICULUM_STATS } from '@/lib/curriculum.generated';
import { PlanCard, PlanCardShell } from './PlanCard';

export const metadata: Metadata = {
    title: 'Pricing — AI Personal Tutor',
    description: `Start free with ${FREE_DAILY_QUESTIONS} AI questions a day across ${CURRICULUM_STATS.subjects} subjects. Upgrade for unlimited questions and the full parent view.`,
};

const faq = [
    {
        q: 'What subjects are covered?',
        a: `${CURRICULUM_STATS.subjects} subjects, ${CURRICULUM_STATS.topics} topics and ${CURRICULUM_STATS.skills} skills, from maths, sciences and languages through to music, design, study skills and exam preparation. Every topic is listed on the subjects page.`,
    },
    {
        q: 'Does it just give my child the answers?',
        a: 'No. The tutor is built to withhold the answer: it offers graduated hints first, explains the underlying concept, and only shows a full worked example when a student is genuinely stuck.',
    },
    {
        q: 'How does it decide what to practice?',
        a: 'A short diagnostic establishes a starting level. From there the tutor tracks mastery per skill, notes recurring misconceptions, and adjusts question difficulty in real time.',
    },
    {
        q: 'What can parents see?',
        a: 'A dashboard of questions answered, accuracy, strong and weak areas, and recurring mistakes — described in plain language, with a recommendation for what to work on next.',
    },
    {
        q: 'What happens after the free questions run out?',
        a: 'Your account keeps working: progress, history and the parent dashboard stay available. Only new AI questions pause until midnight, or until you upgrade.',
    },
    {
        q: 'Is my child’s data private?',
        a: 'Answers are stored per student and only visible to that student and their linked parent account. Row-level security in the database enforces this.',
    },
];

const TRUST = [
    { title: 'No ads, ever', body: 'No third-party advertising or trackers in the product.' },
    { title: 'Strict access', body: 'Row-level security blocks cross-family data access by default.' },
    { title: 'Delete anytime', body: 'You can request account and data deletion at any time.' },
    { title: 'Minimal by design', body: 'We only store what’s needed to teach effectively.' },
];

export default function PricingPage() {
    return (
        <main className="flex min-h-screen flex-col bg-surface">
            <SiteHeader
                nav={[
                    { href: '/#how', label: 'How it works' },
                    { href: '/subjects', label: 'Subjects' },
                    { href: '/pricing', label: 'Pricing' },
                ]}
                cta={{ href: '/signup', label: 'Start Learning' }}
            />

            <section className="shell pt-16 pb-8 text-center">
                <span className="chip bg-brand-soft text-brand-ink ring-1 ring-inset ring-brand-line">
                    Pricing
                </span>
                <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                    Simple plans that grow with your learner.
                </h1>
                <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-ink-soft">
                    Start free. Upgrade when you want unlimited questions and the full parent view.
                </p>
            </section>

            <section className="shell pb-10">
                <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
                    {PLAN_LIST.map((plan) => (
                        <Card
                            key={plan.id}
                            interactive
                            className={plan.featured ? 'border-brand ring-4 ring-brand-soft' : ''}
                        >
                            <PlanCardShell plan={plan}>
                                <PlanCard plan={plan} />
                            </PlanCardShell>
                        </Card>
                    ))}
                </div>
                <p className="mt-5 text-center text-xs text-ink-mute">
                    Cancel any time from your settings page. Prices in USD, billed monthly.
                </p>
            </section>

            <section className="shell pb-16">
                <SectionHeading
                    eyebrow="Privacy"
                    title="What you can count on"
                    description="We designed confidentiality and trust into every layer."
                />
                <TrustStrip items={TRUST} />
            </section>

            <section className="border-y border-line bg-surface-card">
                <div className="shell mx-auto max-w-3xl py-20">
                    <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
                        Questions
                    </h2>
                    <div className="mt-10 space-y-3">
                        {faq.map((f) => (
                            <details key={f.q} className="card group p-5">
                                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                                    {f.q}
                                    <span className="text-lg leading-none text-ink-mute transition-transform group-open:rotate-45">
                                        +
                                    </span>
                                </summary>
                                <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
                                    {f.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <section className="shell py-20 text-center">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to try it?</h2>
                <p className="mx-auto mt-3 max-w-md text-pretty text-ink-soft">
                    The diagnostic takes about two minutes.
                </p>
                <Link href="/signup" className="btn-primary mt-8 px-6 py-3 text-base">
                    Create a free account
                </Link>
            </section>

            <SiteFooter columns={FOOTER_COLUMNS} />
        </main>
    );
}