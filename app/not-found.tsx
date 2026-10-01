import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export const metadata: Metadata = {
    title: 'Page not found',
    description: 'That page does not exist. Head back to the tutor to keep practising.',
    robots: { index: false, follow: true },
};

const SUGGESTIONS = [
    { href: '/dashboard', label: 'Dashboard', detail: 'Today’s progress and what to practise next' },
    { href: '/tutor', label: 'Tutor', detail: 'Pick a topic and start a session' },
    { href: '/subjects', label: 'Subjects', detail: 'Browse the full curriculum' },
    { href: '/pricing', label: 'Pricing', detail: 'Plans and daily question limits' },
];

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col bg-aurora">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

            <header className="relative z-10">
                <div className="shell flex h-16 items-center justify-between gap-4">
                    <Logo />
                    <ThemeSwitcher compact />
                </div>
            </header>

            <main className="relative z-10 flex flex-1 items-center py-12">
                <div className="shell">
                    <div className="mx-auto max-w-xl text-center">
                        <p className="text-7xl font-semibold tracking-tight text-brand-ink">404</p>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            We couldn&apos;t find that page
                        </h1>
                        <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-ink-soft">
                            The link may be out of date, or the page may have moved. Nothing you
                            have practised is lost — your progress lives in your account.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link href="/dashboard" className="btn-primary">
                                Back to dashboard
                            </Link>
                            <Link href="/tutor" className="btn-outline">
                                Start practising
                            </Link>
                        </div>
                    </div>

                    <nav aria-label="Suggested pages" className="mx-auto mt-12 max-w-2xl">
                        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">
                            Or try one of these
                        </p>
                        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                            {SUGGESTIONS.map((s) => (
                                <li key={s.href}>
                                    <Link href={s.href} className="card card-hover block h-full p-5">
                                        <p className="text-sm font-semibold text-ink">{s.label}</p>
                                        <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-mute">
                                            {s.detail}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </main>
        </div>
    );
}