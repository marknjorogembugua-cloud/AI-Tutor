import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { TrustMark } from '@/components/ui/Card';

/**
 * Footer link columns every public page shares.
 *
 * Kept here rather than repeated per page: the legal links were previously
 * missing from every footer, which made privacy and terms effectively
 * unreachable — a compliance problem, not just a design one.
 */
export const FOOTER_COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
    {
        title: 'Product',
        links: [
            { href: '/#how', label: 'How it works' },
            { href: '/subjects', label: 'Subjects' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/faq', label: 'Questions' },
        ],
    },
    {
        title: 'Account',
        links: [
            { href: '/login', label: 'Log in' },
            { href: '/signup', label: 'Create account' },
            { href: '/forgot-password', label: 'Reset password' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
        ],
    },
];

export function SiteHeader({
    nav,
    cta,
}: {
    nav?: { href: string; label: string }[];
    cta?: { href: string; label: string };
}) {
    return (
        <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
            <div className="shell flex h-16 items-center justify-between gap-4">
                <Logo />
                <div className="flex items-center gap-1 sm:gap-2">
                    {nav?.map((n) => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition duration-200 ease-smooth hover:bg-surface-muted hover:text-ink"
                        >
                            {n.label}
                        </Link>
                    ))}
                    <ThemeSwitcher compact />
                    {cta && (
                        <Link href={cta.href} className="btn-primary ml-1 text-sm">
                            {cta.label}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

export function SiteFooter({
    columns,
}: {
    columns?: { title: string; links: { href: string; label: string }[] }[];
}) {
    return (
        <footer className="border-t border-line bg-surface-card">
            <div className="shell py-12">
                <div className="flex flex-col gap-10 md:flex-row md:justify-between">
                    <div className="max-w-sm">
                        <Logo />
                        <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-mute">
                            Adaptive tutoring that notices <em>why</em> a student got something wrong,
                            then teaches that.
                        </p>
                        <p className="mt-4">
                            <TrustMark>Private by default</TrustMark>
                        </p>
                    </div>
                    {columns?.map((c) => (
                        <div key={c.title}>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">
                                {c.title}
                            </p>
                            <ul className="mt-4 space-y-2.5">
                                {c.links.map((l) => (
                                    <li key={l.href + l.label}>
                                        <Link
                                            href={l.href}
                                            className="rounded text-sm text-ink-soft transition duration-200 ease-smooth hover:text-brand-ink"
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm text-ink-mute sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} AI Personal Tutor</p>
                    <p>
                        Answers are visible only to the student and their linked parent.{' '}
                        <Link href="/privacy" className="underline hover:text-brand-ink">
                            How your data is handled
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </footer>
    );
}
