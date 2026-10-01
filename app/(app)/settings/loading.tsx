import Link from 'next/link';

/**
 * Settings placeholder. Small enough that a flash of skeletons would be more
 * distracting than the real content, so this only covers the page header and
 * keeps the layout from collapsing.
 */
export default function LoadingSettings() {
    return (
        <div className="mx-auto max-w-2xl">
            <span role="status" aria-live="polite" className="sr-only">
                Loading your settings…
            </span>
            <p aria-hidden className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                Account
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Settings</h1>
            <p className="mt-4 text-base text-ink-soft">
                Your plan, daily allowance, and billing.
            </p>
            <div aria-hidden className="card mt-8 space-y-4 p-6">
                <div className="skeleton h-4 w-40 rounded-lg" />
                <div className="skeleton h-3 w-full rounded-lg" />
                <div className="skeleton h-3 w-4/5 rounded-lg" />
            </div>
            <p className="mt-4 text-sm">
                <Link href="/dashboard" className="font-medium text-brand-ink hover:underline">
                  Back to dashboard
                </Link>
            </p>
        </div>
    );
}