'use client';

/**
 * Error boundary for the marketing routes.
 *
 * These pages are static and have no session dependency, so a failure here is
 * a build or deploy problem rather than anything a visitor did. The copy says
 * that instead of suggesting they retry.
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function MarketingError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('marketing route failed', error.digest ?? '', error);
    }, [error]);

    return (
        <div className="relative flex min-h-screen flex-col bg-aurora">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

            <header className="relative z-10">
                <div className="shell flex h-16 items-center">
                    <Logo />
                </div>
            </header>

            <main className="relative z-10 flex flex-1 items-center">
                <div className="shell">
                    <div className="mx-auto max-w-lg text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                            Page unavailable
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                            We couldn&apos;t load this page
                        </h1>
                        <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
                            This is on us, not on you. Reload to try again — if it keeps happening,
                            the site is likely mid-deploy.
                        </p>

                        {error.digest && (
                            <p className="mt-4 text-xs text-ink-mute">
                                Reference <code className="font-mono">{error.digest}</code>
                            </p>
                        )}

                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <button type="button" onClick={reset} className="btn-primary">
                                Reload
                            </button>
                            <Link href="/" className="btn-outline">
                                Go to homepage
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}