'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Plan } from '@/lib/billing/plans';

export function PlanCard({ plan }: { plan: Plan }) {
    const router = useRouter();
    const sb = createClient();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function start() {
        setError(null);

        if (plan.id === 'free') {
            router.push('/signup');
            return;
        }

        setBusy(true);
        const { data: { user } } = await sb.auth.getUser();
        if (!user) {
            // Not signed in yet — remember the intent and send them to signup.
            try {
                sessionStorage.setItem('upgrade_intent', plan.id);
            } catch { }
            router.push(`/signup?plan=${plan.id}`);
            return;
        }

        try {
            const res = await fetch('/api/billing/checkout', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ plan: plan.id, returnPath: '/settings' }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok && json.url) {
                window.location.href = json.url;
                return;
            }
            setError(
                json.detail ??
                    (res.status === 503
                        ? 'Checkout is not configured yet.'
                        : 'Could not start checkout. Please try again.')
            );
        } catch {
            setError('Could not reach checkout. Please try again.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <button
                type="button"
                onClick={start}
                disabled={busy}
                className={
                    plan.featured
                        ? 'btn-primary mt-8 w-full disabled:opacity-60'
                        : 'btn-outline mt-8 w-full disabled:opacity-60'
                }
            >
                {busy ? 'Opening checkout…' : plan.id === 'free' ? 'Start learning' : 'Upgrade to Family'}
            </button>
            {error && (
                <p role="alert" className="mt-2 text-center text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}

export function PlanCardShell({
    plan,
    children,
}: {
    plan: Plan;
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ink">{plan.name}</h2>
                {plan.featured && <span className="chip bg-brand text-ink-inverse">Most popular</span>}
            </div>
            <p className="mt-1 text-sm text-ink-mute">{plan.tagline}</p>
            <p className="mt-6">
                <span className="text-4xl font-semibold tracking-tight">
                    {plan.priceCents === 0 ? '$0' : `$${(plan.priceCents / 100).toFixed(0)}`}
                </span>
                <span className="ml-2 text-sm text-ink-mute">
                    {plan.priceCents === 0 ? 'forever' : 'per month'}
                </span>
            </p>
            <ul className="mt-6 flex-1 space-y-2 text-sm text-ink-soft">
                {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                        <span aria-hidden className="text-brand">
                            ✓
                        </span>
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
            {children}
        </div>
    );
}

export { Link };