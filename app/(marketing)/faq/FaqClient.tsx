'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FOOTER_COLUMNS, SiteFooter, SiteHeader } from '@/components/SiteChrome';
import { CURRICULUM_STATS } from '@/lib/curriculum.generated';
import { FREE_DAILY_QUESTIONS } from '@/lib/billing/plans';
import type { FaqGroup } from './faq-content';

/**
 * FAQ page.
 *
 * Client component purely for the filter box and the expand/collapse state —
 * a native <details> would work without JS, but the search needs the full text
 * of every answer on the client, so the answers are passed down as data either
 * way.
 */
export default function FaqPage({ groups }: { groups: FaqGroup[] }) {
    const [query, setQuery] = useState('');

    const q = query.trim().toLowerCase();
    const matches = (g: FaqGroup) =>
        g.items.filter(
            (item) =>
                !q ||
                item.q.toLowerCase().includes(q) ||
                item.a.toLowerCase().includes(q)
        );
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    const shown = groups.reduce((n, g) => n + matches(g).length, 0);

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <SiteHeader
                nav={[
                    { href: '/#how', label: 'How it works' },
                    { href: '/subjects', label: 'Subjects' },
                    { href: '/pricing', label: 'Pricing' },
                ]}
                cta={{ href: '/signup', label: 'Start Learning' }}
            />

            <main className="flex-1">
                <section className="relative border-b border-line bg-aurora">
                    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
                    <div className="shell relative py-16">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                                Questions, answered
                            </h1>
                            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft">
What parents actually ask before signing a child up. If yours
                                isn&apos;t here, the honest answer is in the{' '}
                                <Link href="/privacy" className="font-medium text-brand-ink hover:underline">
                                    privacy policy
                                </Link>
                                .
                        </p>

                        <div className="mx-auto mt-8 max-w-md">
                            <label htmlFor="faq-search" className="sr-only">
                                Search questions
                            </label>
                            <input
                                id="faq-search"
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search questions…"
                                className="input text-left"
                            />
                            <p aria-live="polite" className="mt-2 text-xs text-ink-mute">
                                {q
                                    ? shown === 0
                                        ? 'No questions match that search.'
                                        : `${shown} of ${total} questions match.`
                                    : `${total} questions.`}
                            </p>
                        </div>
                    </div>
                </div>
                </section>

                <div className="shell space-y-12 py-14">
                    {groups.map((group) => {
                        const items = matches(group);
                        if (!items.length) return null;
                        return (
                            <section key={group.title} aria-labelledby={`faq-${group.id}`}>
                                <h2
                                    id={`faq-${group.id}`}
                                    className="text-2xl font-semibold tracking-tight text-ink"
                                >
                                    {group.title}
                                </h2>
                                <div className="mt-5 space-y-3">
                                    {items.map((item) => (
                                        <details
                                            key={item.q}
                                            className="group card overflow-hidden p-0 open:shadow-lift"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left font-medium text-ink">
                                                <span className="text-pretty">{item.q}</span>
                                                <span
                                                    aria-hidden
                                                    className="shrink-0 text-ink-mute transition duration-200 group-open:rotate-45"
                                                >
                                                    +
                                                </span>
                                            </summary>
                                            <div className="border-t border-line px-5 pb-5 pt-4 text-pretty text-sm leading-relaxed text-ink-soft">
                                                {item.a}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {q && shown === 0 && (
                        <div className="card p-8 text-center">
                            <p className="font-semibold text-ink">Nothing matched that search</p>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                                Try a shorter word, or clear the box to see all {total} questions.
                            </p>
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="btn-outline mt-5"
                            >
                                Show all questions
                            </button>
                        </div>
                    )}
                </div>

                <section className="border-t border-line bg-aurora">
                    <div className="shell py-14 text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-ink">
                            Ready to try it?
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-ink-soft">
                            The free tier gives {FREE_DAILY_QUESTIONS} questions a day across all{' '}
                            {CURRICULUM_STATS.subjects} subjects. No card, and you can delete the
                            account from Settings at any time.
                        </p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                                Create a free account
                            </Link>
                            <Link href="/pricing" className="btn-outline px-6 py-3 text-base">
                                Compare plans
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter columns={FOOTER_COLUMNS} />
        </div>
    );
}