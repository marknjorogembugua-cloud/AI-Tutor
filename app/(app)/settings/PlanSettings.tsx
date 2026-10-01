'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Entitlements } from '@/lib/billing/entitlements';
import { FREE_DAILY_QUESTIONS } from '@/lib/billing/plans';

export default function PlanSettings({ entitlements }: { entitlements: Entitlements }) {
    const router = useRouter();
    const [busy, setBusy] = useState<'checkout' | 'portal' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { isPaid, plan, dailyLimit, usedToday, cancelAtPeriodEnd, currentPeriodEnd } =
        entitlements;

    async function post(url: string, kind: 'checkout' | 'portal') {
        setBusy(kind);
        setError(null);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ plan: 'family', returnPath: '/settings' }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.url) {
                window.location.href = json.url;
                return;
            }
            setError(
                json.detail ??
                    (res.status === 503
                        ? 'Billing is not configured on this deployment yet.'
                        : 'Something went wrong. Please try again.')
            );
        } catch {
            setError('Could not reach the billing service. Please try again.');
        } finally {
            setBusy(null);
        }
    }

    const periodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : null;

    return (
        <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-ink">Your plan</h2>
                    <p className="mt-1 text-sm text-ink-mute">
                        Currently on <span className="font-medium text-ink">{plan.name}</span>
                        {isPaid ? '.' : ' — no card required.'}
                    </p>
                </div>
                <span
                    className={
                        isPaid
                            ? 'chip bg-brand text-ink-inverse'
                            : 'chip bg-brand-soft text-brand-ink ring-1 ring-inset ring-brand-line'
                    }
                >
                    {isPaid ? 'Active' : 'Free'}
                </span>
            </div>

            {!isPaid && (
                <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium text-ink">Today&apos;s questions</span>
                        <span className="text-ink-mute">
                            {usedToday ?? 0} of {dailyLimit} used
                        </span>
                    </div>
                    <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-brand-soft"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={dailyLimit}
                        aria-valuenow={usedToday ?? 0}
                        aria-label="Questions used today"
                    >
                        <div
                            className="h-full rounded-full bg-brand transition-all duration-300"
                            style={{
                                width: `${Math.min(
                                    100,
                                    ((usedToday ?? 0) / Math.max(dailyLimit, 1)) * 100
                                )}%`,
                            }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-ink-mute">
                        Your allowance resets at midnight. Everything else stays available.
                    </p>
                </div>
            )}

            {isPaid && (
                <p className="mt-4 text-sm text-ink-soft">
                    {cancelAtPeriodEnd
                        ? `Ends on ${periodEnd ?? 'the end of the period'}. You can keep using it until then.`
                        : `Renews on ${periodEnd ?? 'the next billing date'}.`}
                </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
                {!isPaid ? (
                    <button
                        type="button"
                        onClick={() => post('/api/billing/checkout', 'checkout')}
                        disabled={busy !== null}
                        className="btn-primary disabled:opacity-60"
                    >
                        {busy === 'checkout' ? 'Opening checkout…' : 'Upgrade to Family'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => post('/api/billing/portal', 'portal')}
                        disabled={busy !== null}
                        className="btn-outline disabled:opacity-60"
                    >
                        {busy === 'portal' ? 'Opening…' : 'Manage billing'}
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => router.push('/tutor')}
                    className="btn-ghost"
                >
                    Back to practice
                </button>
            </div>

            {error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                    {error}
                </p>
            )}

            {!isPaid && (
                <p className="mt-5 border-t border-line pt-4 text-xs text-ink-mute">
                    Free accounts get {FREE_DAILY_QUESTIONS} AI questions per day. Family is $19/month
                    and removes the limit.
                </p>
            )}
        </div>
    );
}