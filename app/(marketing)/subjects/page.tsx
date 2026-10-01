import type { Metadata } from 'next';
import Link from 'next/link';
import { FOOTER_COLUMNS, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { SectionHeading } from '@/components/ui/Card';
import { InlineTrust, PrivacyNote } from '@/components/Trust';
import { CURRICULUM, CURRICULUM_STATS } from '@/lib/curriculum.generated';
import { FREE_DAILY_QUESTIONS } from '@/lib/billing/plans';
import SubjectCatalogue from './SubjectCatalogue';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '';

export const metadata: Metadata = {
    title: 'Subjects — AI Personal Tutor',
    description: `Every subject available in the tutor: ${CURRICULUM_STATS.subjects} subjects, ${CURRICULUM_STATS.topics} topics and ${CURRICULUM_STATS.skills} skills, from maths and sciences to languages, music and exam preparation.`,
    alternates: SITE_URL ? { canonical: `${SITE_URL}/subjects` } : undefined,
    openGraph: {
        title: 'Subjects — AI Personal Tutor',
        description: `${CURRICULUM_STATS.subjects} subjects, ${CURRICULUM_STATS.topics} topics, ${CURRICULUM_STATS.skills} skills. Search the full curriculum.`,
        url: SITE_URL ? `${SITE_URL}/subjects` : undefined,
        type: 'website',
    },
};

export default function SubjectsPage() {
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

            <section className="relative overflow-hidden border-b border-line bg-aurora">
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
                <div className="shell relative py-16 sm:py-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="chip bg-brand-soft text-brand-ink ring-1 ring-inset ring-brand-line">
                            {CURRICULUM_STATS.subjects} subjects
                        </span>
                        <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                            Everything your child wants to learn.
                        </h1>
                        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft">
                            {CURRICULUM_STATS.topics} topics and {CURRICULUM_STATS.skills} skills
                            the tutor can generate questions from. Each topic starts with a
                            diagnostic and adapts as your child works through it.
                        </p>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link href="/signup" className="btn-primary w-full px-6 py-3 sm:w-auto">
                                Start learning free
                            </Link>
                            <Link href="/pricing" className="btn-outline w-full px-6 py-3 sm:w-auto">
                                {FREE_DAILY_QUESTIONS} questions a day, free
                            </Link>
                        </div>
                        <InlineTrust
                            className="mt-8 justify-center"
                            items={[
                                'No ads or trackers',
                                'Row-level security',
                                'Parent-only visibility',
                            ]}
                        />
                    </div>
                </div>
            </section>

            <section className="shell py-16">
                <SectionHeading
                    align="left"
                    eyebrow="The catalogue"
                    title="Search the whole curriculum"
                    description="Search by subject, topic or keyword. Every topic is practiceable — pick one and the tutor adapts from there."
                />
                <SubjectCatalogue subjects={CURRICULUM} />
            </section>

            <section className="border-y border-line bg-surface-card">
                <div className="shell grid gap-10 py-16 md:grid-cols-3">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-ink">
                            How the tutor uses this
                        </h2>
                    </div>
                    <div className="space-y-4 text-sm leading-relaxed text-ink-soft">
                        <p>
                            Each topic holds a list of skills. The tutor picks a skill the learner
                            has not mastered, generates a question for it at the right difficulty,
                            and then reads the answer to decide what to do next.
                        </p>
                        <p>
                            A wrong answer is not just a wrong answer — it is recorded as a possible
                            misconception, and the next question is chosen to address it.
                        </p>
                        <p>
                            If a skill proves too hard, difficulty drops. Once it is secure, it
                            rises. The student is never asked to sit through material they already
                            know.
                        </p>
                    </div>
                    <PrivacyNote title="Subjects are not data">
                        Choosing a subject tells us nothing sensitive about a child. Only the
                        answers and progress within an account are stored, and only that account
                        and its linked parent can read them.
                    </PrivacyNote>
                </div>
            </section>

            <section className="shell py-20 text-center">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Found what you need?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-pretty text-ink-soft">
                    The diagnostic takes about two minutes and sets the starting level.
                </p>
                <Link href="/signup" className="btn-primary mt-8 px-6 py-3 text-base">
                    Create a free account
                </Link>
            </section>

            <SiteFooter columns={FOOTER_COLUMNS} />
        </main>
    );
}