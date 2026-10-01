'use client';

/**
 * Route-level error boundary for the signed-in app.
 *
 * Next.js renders this instead of the page when a server component or render
 * throws. It must be a client component, and the retry button works because
 * `reset()` re-runs the failed render rather than reloading the document.
 *
 * Errors here are usually recoverable — a dropped connection or a query that
 * timed out — so the message says so instead of implying the account is broken.
 */

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Server-side errors arrive with a digest but no message, so log the
        // digest — it is what ties this render to the server log entry.
        console.error('app route failed', error.digest ?? '', error);
    }, [error]);

    return (
        <div className="mx-auto max-w-lg py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                Something went wrong
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                This page didn&apos;t load
            </h1>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-soft">
                Your progress is saved — nothing you&apos;ve practised has been lost. Try again,
                and if it keeps happening head back to the dashboard.
            </p>

            {error.digest && (
                <p className="mt-4 text-xs text-ink-mute">
                    Reference <code className="font-mono">{error.digest}</code>
                </p>
            )}

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={reset} className="btn-primary">
                    Try again
                </button>
                <Link href="/dashboard" className="btn-outline">
                    Back to dashboard
                </Link>
            </div>
        </div>
    );
}