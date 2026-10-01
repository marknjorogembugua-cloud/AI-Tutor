import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { FOOTER_COLUMNS, SiteFooter, SiteHeader } from '@/components/SiteChrome';

/**
 * Shared chrome for the long-form public pages (privacy, terms).
 *
 * Both are mostly prose and diverge fast; this keeps the header, footer, measure
 * and heading rhythm identical so a reader moving between them sees one site.
 */

export const LEGAL_NAV = [
    { href: '/#how', label: 'How it works' },
    { href: '/subjects', label: 'Subjects' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/faq', label: 'Questions' },
];

export const LEGAL_CTA = { href: '/signup', label: 'Start Learning' };

/** 68ch is the widest measure that stays comfortable to read at this size. */
export function Prose({ children }: { children: ReactNode }) {
    return <div className="prose-doc">{children}</div>;
}

export function LegalPage({
    title,
    updated,
    intro,
    children,
}: {
    title: string;
    /** Plain-language date, e.g. '1 October 2026'. */
    updated: string;
    intro: string;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <SiteHeader nav={LEGAL_NAV} cta={LEGAL_CTA} />

            <main className="flex-1">
                <section className="relative border-b border-line bg-aurora">
                    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
                    <div className="shell relative py-16">
                        <div className="mx-auto max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                                Last updated {updated}
                            </p>
                            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                                {title}
                            </h1>
                            <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-soft">
                                {intro}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="shell py-14">
                    <Prose>{children}</Prose>
                </div>

                <section className="border-t border-line bg-aurora">
                    <div className="shell py-14 text-center">
                        <h2 className="text-2xl font-semibold tracking-tight text-ink">
                            Still deciding?
                        </h2>
                        <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-ink-soft">
                            Start with the free tier — no card, no commitment. If it isn&apos;t for
                            you, delete the account from Settings and it&apos;s gone.
                        </p>
                        <Link href="/signup" className="btn-primary mt-7 px-6 py-3 text-base">
                            Create a free account
                        </Link>
                    </div>
                </section>
            </main>

            <SiteFooter columns={FOOTER_COLUMNS} />
        </div>
    );
}

/**
 * Shared metadata shape. Titles are absolute (not templated against a layout
 * default) so search results read "Privacy — AI Personal Tutor" rather than
 * inheriting the homepage title.
 */
export function legalMetadata(title: string, slug: string, description: string): Metadata {
    return {
        title: `${title} — AI Personal Tutor`,
        description,
        // Page-specific, so this is safe to state here in a way the root
        // layout's canonical is not.
        alternates: { canonical: `/${slug}` },
    };
}