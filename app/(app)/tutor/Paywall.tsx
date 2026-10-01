'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FREE_DAILY_QUESTIONS } from '@/lib/billing/plans';

export type QuotaError = {
    error: 'daily_limit_reached';
    message: string;
    limit: number;
    usedToday: number | null;
};

/**
 * Shown when the API refuses to generate content because the daily free
 * allowance is spent. Not a dead end: the learner's progress and history are
 * untouched, and the limit resets at midnight.
 */
export default function Paywall({ detail, onDismiss }: { detail: QuotaError; onDismiss?: () => void }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function upgrade() {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ plan: 'family', returnPath: '/tutor' }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.url) {
                window.location.href = json.url;
                return;
            }
            setError(json.detail ?? 'Checkout is not available right now.');
        } catch {
            setError('Could not reach checkout.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card border-brand bg-brand-soft/40 p-6 text-center">
            <span aria-hidden className="text-2xl">🎯</span>
            <h2 className="mt-2 text-lg font-semibold text-ink">
                You&apos;ve used today&apos;s {detail.limit} free questions
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                Your streak, mastery and history are all safe — only new questions are paused.
                They reset at midnight, or upgrade now for unlimited practice.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                    type="button"
                    onClick={upgrade}
                    disabled={busy}
                    className="btn-primary disabled:opacity-60"
                >
                    {busy ? 'Opening checkout…' : 'Upgrade to Family — $19/mo'}
                </button>
                <button type="button" onClick={() => router.push('/settings')} className="btn-outline">
                    See my plan
                </button>
                {onDismiss && (
                    <button type="button" onClick={onDismiss} className="btn-ghost">
                        Keep reviewing
                    </button>
                )}
            </div>

            <p className="mt-4 text-xs text-ink-mute">
                Free accounts always get {FREE_DAILY_QUESTIONS} questions a day. Cancel any time.
            </p>

            {error && (
                <p role="alert" className="mt-3 text-sm text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}